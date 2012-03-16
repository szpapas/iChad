-- Table: timage_tj

DROP TABLE timage_tj;

CREATE TABLE timage_tj
(
  id serial NOT NULL,
  dh character varying(100),
  ajh integer, 
  ajys integer DEFAULT 0,
  ml00 integer DEFAULT 0,
  mlbk integer DEFAULT 0,
  mljn integer DEFAULT 0,
  jn00 integer DEFAULT 0,
  jnbk integer DEFAULT 0,
  jnjn integer DEFAULT 0,
  smyx integer DEFAULT 0,
  pixel integer DEFAULT 0,
  CONSTRAINT timage_tj_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE timage_tj OWNER TO postgres;

-- Index: timage_tj_dh_index

-- DROP INDEX timage_tj_dh_index;

CREATE INDEX timage_tj_dh_index
  ON timage_tj
  USING btree
  (dh);