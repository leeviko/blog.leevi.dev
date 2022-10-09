CREATE FUNCTION update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.modified = current_timestamp;
    RETURN NEW;   
END;
$$;

CREATE TABLE IF NOT EXISTS posts (
    authorid character varying,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    tags text[],
    private boolean NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    postid character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    status character varying(25) DEFAULT 'draft'::character varying NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id character varying(255) NOT NULL,
    username character varying(50) NOT NULL,
    description character varying(255),
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    admin boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (postid);


ALTER TABLE ONLY users
    ADD CONSTRAINT users_name_key UNIQUE (username);


ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


ALTER TABLE ONLY posts
    ADD CONSTRAINT fk_author FOREIGN KEY (authorid) REFERENCES public.users(id) ON DELETE CASCADE;
