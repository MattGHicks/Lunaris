-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "alliance_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "galaxy" INTEGER NOT NULL,
    "system" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "coordinates" TEXT NOT NULL,
    "fields" INTEGER NOT NULL DEFAULT 163,
    "used_fields" INTEGER NOT NULL DEFAULT 0,
    "temperature" INTEGER NOT NULL DEFAULT 20,
    "is_moon" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "planets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "upgrading" BOOLEAN NOT NULL DEFAULT false,
    "upgrade_end_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "planet_id" TEXT NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "metal" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "crystal" DOUBLE PRECISION NOT NULL DEFAULT 300,
    "deuterium" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "energy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "planet_id" TEXT NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research" (
    "id" TEXT NOT NULL,
    "espionage_tech" INTEGER NOT NULL DEFAULT 0,
    "computer_tech" INTEGER NOT NULL DEFAULT 0,
    "weapons_tech" INTEGER NOT NULL DEFAULT 0,
    "shielding_tech" INTEGER NOT NULL DEFAULT 0,
    "armor_tech" INTEGER NOT NULL DEFAULT 0,
    "energy_tech" INTEGER NOT NULL DEFAULT 0,
    "hyperspace_tech" INTEGER NOT NULL DEFAULT 0,
    "combustion_drive" INTEGER NOT NULL DEFAULT 0,
    "impulse_drive" INTEGER NOT NULL DEFAULT 0,
    "hyperspace_drive" INTEGER NOT NULL DEFAULT 0,
    "laser_tech" INTEGER NOT NULL DEFAULT 0,
    "ion_tech" INTEGER NOT NULL DEFAULT 0,
    "plasma_tech" INTEGER NOT NULL DEFAULT 0,
    "astrophysics" INTEGER NOT NULL DEFAULT 0,
    "research_network" INTEGER NOT NULL DEFAULT 0,
    "expedition_tech" INTEGER NOT NULL DEFAULT 0,
    "graviton_tech" INTEGER NOT NULL DEFAULT 0,
    "researching" BOOLEAN NOT NULL DEFAULT false,
    "current_research" TEXT,
    "research_end_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleets" (
    "id" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "ships" JSONB NOT NULL,
    "cargo" JSONB,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "return_time" TIMESTAMP(3),
    "fuel_consumption" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'traveling',
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "origin_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,

    CONSTRAINT "fleets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alliances" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alliances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'message',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officers" (
    "id" TEXT NOT NULL,
    "commander" TIMESTAMP(3),
    "admiral" TIMESTAMP(3),
    "engineer" TIMESTAMP(3),
    "geologist" TIMESTAMP(3),
    "technocrat" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "officers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "planets_coordinates_key" ON "planets"("coordinates");

-- CreateIndex
CREATE INDEX "planets_user_id_idx" ON "planets"("user_id");

-- CreateIndex
CREATE INDEX "planets_galaxy_system_position_idx" ON "planets"("galaxy", "system", "position");

-- CreateIndex
CREATE INDEX "buildings_planet_id_idx" ON "buildings"("planet_id");

-- CreateIndex
CREATE INDEX "buildings_upgrading_idx" ON "buildings"("upgrading");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_planet_id_type_key" ON "buildings"("planet_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "resources_planet_id_key" ON "resources"("planet_id");

-- CreateIndex
CREATE UNIQUE INDEX "research_user_id_key" ON "research"("user_id");

-- CreateIndex
CREATE INDEX "fleets_user_id_idx" ON "fleets"("user_id");

-- CreateIndex
CREATE INDEX "fleets_arrival_time_idx" ON "fleets"("arrival_time");

-- CreateIndex
CREATE INDEX "fleets_return_time_idx" ON "fleets"("return_time");

-- CreateIndex
CREATE INDEX "fleets_status_idx" ON "fleets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "alliances_name_key" ON "alliances"("name");

-- CreateIndex
CREATE UNIQUE INDEX "alliances_tag_key" ON "alliances"("tag");

-- CreateIndex
CREATE INDEX "alliances_name_idx" ON "alliances"("name");

-- CreateIndex
CREATE INDEX "alliances_tag_idx" ON "alliances"("tag");

-- CreateIndex
CREATE INDEX "messages_recipient_id_read_idx" ON "messages"("recipient_id", "read");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "officers_user_id_key" ON "officers"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_alliance_id_fkey" FOREIGN KEY ("alliance_id") REFERENCES "alliances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planets" ADD CONSTRAINT "planets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_planet_id_fkey" FOREIGN KEY ("planet_id") REFERENCES "planets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_planet_id_fkey" FOREIGN KEY ("planet_id") REFERENCES "planets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research" ADD CONSTRAINT "research_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleets" ADD CONSTRAINT "fleets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleets" ADD CONSTRAINT "fleets_origin_id_fkey" FOREIGN KEY ("origin_id") REFERENCES "planets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleets" ADD CONSTRAINT "fleets_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "planets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "officers" ADD CONSTRAINT "officers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
