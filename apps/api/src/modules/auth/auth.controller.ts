import {
  Controller, Post, Get, Patch, Body, HttpCode, HttpStatus,
  Req, Res, UseGuards, UnauthorizedException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import {
  RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto,
  ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto,
} from './dto/auth.dto'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { AuthUser } from './jwt.strategy'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'إنشاء حساب جديد' })
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تسجيل الدخول' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto, req.ip, req.headers['user-agent'])
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    })
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return result
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تجديد رمز الوصول' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = dto.refreshToken || req.cookies?.refresh_token
    if (!token) throw new UnauthorizedException('جلسة غير صالحة')
    const result: any = await this.auth.refresh(token)
    if (result?.accessToken) {
      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 })
    }
    if (result?.refreshToken) {
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
    }
    return result
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تسجيل الخروج' })
  async logout(@CurrentUser('id') userId: string, @Req() req: Request) {
    return this.auth.logout(userId, req.cookies?.refresh_token)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الملف الشخصي الحالي' })
  async me(@CurrentUser('id') userId: string) {
    return this.auth.getProfile(userId)
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث الملف الشخصي' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(userId, dto)
  }

  @Patch('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تغيير كلمة المرور' })
  async changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(userId, dto)
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'طلب استعادة كلمة المرور' })
  async forgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email)
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تعيين كلمة مرور جديدة' })
  async reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto)
  }
}
