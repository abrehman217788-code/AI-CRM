import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChatbotService } from './chatbot.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @Public()
  @Post('message')
  @ApiOperation({ summary: 'Handle chatbot message from website visitor' })
  handleMessage(@Body() dto: { visitorId: string; message: string; sessionId?: string; leadId?: string; metadata?: any }) {
    return this.chatbotService.handleMessage(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chatbot sessions' })
  getSessions(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.chatbotService.getSessions(page, limit);
  }
}
