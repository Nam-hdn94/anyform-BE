import { Module } from "@nestjs/common";
import { AppService } from "src/app.service";

@Module({
    providers: [AppService],
})
export class ApiModule {}