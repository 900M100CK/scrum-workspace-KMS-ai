\getenv workspace_password WORKSPACE_DB_PASSWORD
\getenv knowledge_password KNOWLEDGE_DB_PASSWORD
CREATE ROLE workspace_owner NOLOGIN;
CREATE ROLE knowledge_owner NOLOGIN;
CREATE ROLE workspace_app LOGIN PASSWORD :'workspace_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE knowledge_app LOGIN PASSWORD :'knowledge_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE DATABASE workspace_db OWNER workspace_owner;
CREATE DATABASE knowledge_db OWNER knowledge_owner;
REVOKE ALL ON DATABASE workspace_db, knowledge_db, postgres, template1 FROM PUBLIC;
GRANT CONNECT ON DATABASE workspace_db TO workspace_app;
GRANT CONNECT ON DATABASE knowledge_db TO knowledge_app;
ALTER ROLE workspace_app IN DATABASE workspace_db SET search_path = workspace, pg_catalog;
ALTER ROLE knowledge_app IN DATABASE knowledge_db SET search_path = knowledge, public, pg_catalog;
\connect workspace_db
REVOKE ALL ON SCHEMA public FROM PUBLIC;
\connect knowledge_db
REVOKE ALL ON SCHEMA public FROM PUBLIC;
CREATE EXTENSION vector WITH SCHEMA public VERSION '0.8.2';
GRANT USAGE ON SCHEMA public TO knowledge_owner, knowledge_app;
