-- DropIndex
DROP INDEX "complaints_status_idx";

-- DropIndex
DROP INDEX "complaints_created_at_idx";

-- CreateIndex
CREATE INDEX "complaints_deleted_at_status_idx" ON "complaints"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "complaints_deleted_at_created_at_idx" ON "complaints"("deleted_at", "created_at");

