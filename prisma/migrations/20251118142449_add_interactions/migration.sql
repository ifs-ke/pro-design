-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
