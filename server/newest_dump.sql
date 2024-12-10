
DROP TABLE IF EXISTS public."Custom" CASCADE;
DROP TABLE IF EXISTS public."Favorites" CASCADE;
DROP TABLE IF EXISTS public."GroupMembers" CASCADE;
DROP TABLE IF EXISTS public."GroupRequests" CASCADE;
DROP TABLE IF EXISTS public.movie_genres CASCADE;
DROP TABLE IF EXISTS public."Review" CASCADE;

DROP TABLE IF EXISTS public."Users" CASCADE;
DROP TABLE IF EXISTS public."Groups" CASCADE;
DROP TABLE IF EXISTS public."Genres" CASCADE;
DROP TABLE IF EXISTS public."Movies" CASCADE;
DROP TABLE IF EXISTS public."Showtimes" CASCADE;

CREATE TABLE IF NOT EXISTS public."Users" (
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    email character varying(255) COLLATE pg_catalog."default",
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS public."Genres" (
    genre_id character varying(150) COLLATE pg_catalog."default" NOT NULL,
    genre_name character varying(150) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Genres_pkey" PRIMARY KEY (genre_id)
);

CREATE TABLE IF NOT EXISTS public."Groups" (
    id serial NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    creator_id integer NOT NULL,
    CONSTRAINT "Groups_pkey" PRIMARY KEY (id),
    CONSTRAINT "Groups_name_key" UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public."Movies" (
    id integer NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    release_year integer,
    poster_path character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT "Movies_pkey" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."Showtimes" (
    id integer NOT NULL DEFAULT nextval('showtimes_id_seq'::regclass),
    movie_title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    theatre_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    show_time timestamp without time zone,
    picture character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT "Showtimes_pkey" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."Custom" (
    group_id integer,
    movie_id integer,
    showtime integer,
    CONSTRAINT "Custom_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."Groups" (id) ON DELETE CASCADE,
    CONSTRAINT showtime_id_fkey FOREIGN KEY (showtime) REFERENCES public."Showtimes" (id)
);

CREATE TABLE IF NOT EXISTS public."Favorites" (
    user_id integer NOT NULL,
    movie_id integer NOT NULL,
    public boolean DEFAULT false,
    CONSTRAINT "Favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users" (id)
);

CREATE TABLE IF NOT EXISTS public."GroupMembers" (
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT "GroupMembers_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."Groups" (id),
    CONSTRAINT "GroupMembers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users" (id)
);

CREATE TABLE IF NOT EXISTS public."GroupRequests" (
    id serial NOT NULL,
    group_id integer,
    user_id integer,
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'pending',
    request_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupRequests_pkey" PRIMARY KEY (id),
    CONSTRAINT "GroupRequests_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."Groups" (id) ON DELETE CASCADE,
    CONSTRAINT "GroupRequests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users" (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.movie_genres (
    movie_id integer NOT NULL,
    genre_id character varying(150) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT movie_genres_pkey PRIMARY KEY (movie_id, genre_id),
    CONSTRAINT movie_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public."Genres" (genre_id),
    CONSTRAINT movie_genres_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public."Movies" (id)
);

CREATE TABLE IF NOT EXISTS public."Review" (
    movie_id integer NOT NULL,
    user_email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    stars integer NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now(),
    comment text COLLATE pg_catalog."default",
    CONSTRAINT "Review_user_email_fkey" FOREIGN KEY (user_email) REFERENCES public."Users" (email)
);
