import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('insights/:leadId')
  @ApiOperation({ summary: 'Get AI insights for a lead' })
  getLeadInsights(@Param('leadId') leadId: string) {
    return this.aiService.getLeadInsights(leadId);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI recommendations for current user' })
  getRecommendations(@CurrentUser('id') userId: string) {
    return this.aiService.getRecommendations(userId);
  }

  @Get('predict-score/:leadId')
  @ApiOperation({ summary: 'Predict lead conversion score using AI' })
  predictScore(@Param('leadId') leadId: string) {
    return this.aiService.predictLeadScore(leadId);
  }

  @Post('suggest-email/:leadId')
  @ApiOperation({ summary: 'Generate AI email suggestions for a lead' })
  suggestEmail(@Param('leadId') leadId: string, @Body('context') context?: string) {
    return this.aiService.suggestEmailContent(leadId, context);
  }
}
