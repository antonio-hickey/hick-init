import { snakeCaseToTitleCase } from './../util.js';

/// Cargo.toml boilerplate
export function cargoConfig(projName: string) {
  return `[package]
name = "${projName}"
version = "0.1.0"
edition = "2021"
authors = ["Antonio Hickey <contact@antoniohickey.com>"]

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html
[dependencies]
actix-web = "4"
anyhow = "1.0.75"
dotenv = "0.15.0"
env_logger = "0.10.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
sqlx = { version = "0.7", features = [ "runtime-tokio", "tls-rustls", "postgres" ] }
  `;
}

/// src/main.rs boilerplate
export function mainFile(projName: string) {
  return `mod error;
mod routes;
mod structs;

use actix_web::{web::Data, App, HttpServer};
use anyhow::Result;
use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::{sync::Mutex, time::Duration};
use structs::AppState;

#[actix_web::main]
async fn main() -> Result<()> {
    // Leave debug stuff for now
    std::env::set_var("RUST_LOG", "debug");
    env_logger::init();
    dotenv().ok();

    // Create a connection pool to our database
    let db_url = std::env::var("DB_URL")?;
    let db_pool = PgPoolOptions::new()
        .max_connections(5)
        .max_lifetime(Duration::new(6, 0)) // max db connection lifetime of 6 seconds for now
        .connect(&db_url)
        .await?;

    // A shared app state among requests for tracking active connections,
    // database connection pool, and the max payload size.
    let app_state = Data::new(AppState {
        active_cnx: Mutex::new(0),
        max_payload_size: 262_144,
        db_pool,
    });

    // Build, Setup, & Start The Api (HTTP SERVER)
    Ok(HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .configure(routes::config::configure_routes)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await?)
}

  `;
}

export function errorHandling(projName: string) {
  const TitleCaseName = snakeCaseToTitleCase(projName);

  return `use std::fmt;

/// ${TitleCaseName} Error
#[derive(Debug)]
pub enum ${TitleCaseName}Error {
    AnyhowError(anyhow::Error),
    SqlError(sqlx::Error),
}
// Implement display trait for \`${TitleCaseName}\`
impl fmt::Display for ${TitleCaseName}Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // TODO: Think of more meaningful display messages
        write!(f, "error")
    }
}
/// Implement \`ResponseError\` for actix-web Responder
impl actix_web::error::ResponseError for ${TitleCaseName}Error {}
/// Implement error conversion (\`anyhow::Error\` -> \`${TitleCaseName}Error\`)
impl From<anyhow::Error> for ${TitleCaseName}Error {
    fn from(err: anyhow::Error) -> ${TitleCaseName}Error {
        ${TitleCaseName}Error::AnyhowError(err)
    }
}
/// Implement error conversion (\`sqlx::Error\` -> \`${TitleCaseName}Error\`)
impl From<sqlx::Error> for ${TitleCaseName}Error {
    fn from(err: sqlx::Error) -> ${TitleCaseName}Error {
        ${TitleCaseName}Error::SqlError(err)
    }
}
  `;
}

export function defaultStructs() {
  return `use sqlx::PgPool;
use std::sync::Mutex;

#[derive(Debug)]
pub struct AppState {
    pub active_cnx: Mutex<u32>,
    pub db_pool: PgPool,
    pub max_payload_size: usize,
}

  `
}

export function exampleRoute(projName: string) {
  const TitleCaseName = snakeCaseToTitleCase(projName);

  return `use crate::{error::${TitleCaseName}Error, structs::AppState};
use actix_web::{
    post, get,
    web::{Data, self},
    HttpResponse,
    Responder,
};
use std::result::Result;

#[post("/echo")]
/// Example endpoint to echo back a payload from a POST request
pub async fn echo(
    _state: Data<AppState>,
    payload: String,
) -> Result<HttpResponse, ${TitleCaseName}Error> {
    // Respond with the payload 
    // the requester sent
    Ok(HttpResponse::Ok().body(payload))
}

#[get("/{name}")]
async fn welcome(path: web::Path<String>) -> impl Responder {
    HttpResponse::Ok().body(format!("Hello {}", path.into_inner()))
}

  `
}

export function routeConfig() {
  return `use crate::routes;
use actix_web::web;

/// Configures all the api routes
pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/example")
            .service(routes::example::welcome)
            .service(routes::example::echo)
    );
}  

  `
}

export function routeMod() {
  return `pub mod example;
pub mod config;

  `
}

export function webRoutes(projName: string) {
  const TitleCaseName = snakeCaseToTitleCase(projName);

  return `use crate::error::${TitleCaseName}Error;
use actix_web::{
    get,
    web::Data,
};
use actix_files::NamedFile;

#[get("/")]
pub async fn get_index() -> Result<NamedFile, ${TitleCaseName}Error> {
    Ok(NamedFile::open("src/web/dist/index.html").unwrap())
}
`
}

export function webServices() {
  return `
    .service(
        web::scope("web")
            .service(routes::web::get_index)
    )
    .service(
        web::scope("assets")
            .service(routes::web::get_index_js)
            .service(routes::web::get_index_css)
            .service(routes::web::get_react_svg),
    );
}
`
}


