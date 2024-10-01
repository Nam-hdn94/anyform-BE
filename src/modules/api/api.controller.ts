import { Controller } from "@nestjs/common";
import { AppService } from "src/app.service";

@Controller('api')
export class ApiController{
    constructor(private apiService: AppService) {}
}