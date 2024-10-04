import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";
import { DeviceService } from "src/device/device.service";
import { Auth } from "firebase-admin/lib/auth/auth";
import { ApiOperation } from "@nestjs/swagger";

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private divService: DeviceService,
    ){}
}