import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LeadSource, LeadStatus } from '@prisma/client';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(private prisma: PrismaService) {}

  async handleMessage(dto: {
    visitorId: string;
    message: string;
    sessionId?: string;
    leadId?: string;
    metadata?: any;
  }) {
    const intent = this.classifyIntent(dto.message);
    const response = this.generateResponse(intent, dto);

    if (intent === 'book_meeting' || intent === 'interested') {
      const lead = await this.findOrCreateLead(dto);
      const messages = [{ role: 'visitor', content: dto.message }, { role: 'bot', content: response }] as any;

      if (dto.sessionId) {
        const existing = await this.prisma.chatbotSession.findUnique({ where: { id: dto.sessionId } });
        if (existing) {
          await this.prisma.chatbotSession.update({
            where: { id: dto.sessionId },
            data: {
              messages: [...(existing.messages as any[] || []), ...messages],
              intent,
              qualified: intent === 'book_meeting',
            },
          });
          return { sessionId: dto.sessionId, intent, response, qualified: intent === 'book_meeting' };
        }
      }

      const session = await this.prisma.chatbotSession.create({
        data: {
          leadId: lead.id,
          visitorId: dto.visitorId,
          messages,
          intent,
          qualified: intent === 'book_meeting',
          metadata: dto.metadata,
        },
      });

      return { sessionId: session.id, intent, response, qualified: intent === 'book_meeting' };
    }

    return { intent, response, qualified: false };
  }

  async getSessions(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.chatbotSession.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: { lead: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.chatbotSession.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  private classifyIntent(message: string): string {
    const msg = message.toLowerCase();
    if (msg.includes('book') || msg.includes('meeting') || msg.includes('schedule') || msg.includes('call') || msg.includes('demo')) return 'book_meeting';
    if (msg.includes('price') || msg.includes('cost') || msg.includes('pricing') || msg.includes('plan')) return 'pricing';
    if (msg.includes('feature') || msg.includes('capability') || msg.includes('what do') || msg.includes('how does')) return 'features';
    if (msg.includes('interested') || msg.includes('learn more') || msg.includes('tell me')) return 'interested';
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('good')) return 'greeting';
    if (msg.includes('help') || msg.includes('support') || msg.includes('contact')) return 'support';
    return 'general';
  }

  private generateResponse(intent: string, context: any): string {
    switch (intent) {
      case 'greeting':
        return 'Hi there! 👋 I\'m the AI CRM assistant. I can help you learn more about our platform, book a demo, or answer questions. What would you like to know?';
      case 'book_meeting':
        return 'I\'d be happy to schedule a demo! Let me create a lead record and someone from our team will reach out to book a time that works for you.';
      case 'pricing':
        return 'Our pricing starts at $29/seat/month with a free trial available. Would you like me to connect you with a sales rep for a detailed quote?';
      case 'features':
        return 'Our AI-powered CRM offers lead capture, smart scoring, email sequences, pipeline management, analytics, and workflow automation. Would you like to see a demo?';
      case 'interested':
        return 'Great to hear! Let me capture your details so our team can follow up with more information tailored to your needs.';
      case 'support':
        return 'Our support team is available 24/7. You can reach us at support@aicrm.com or I can create a ticket for you.';
      default:
        return 'Thanks for your message! Let me connect you with a human who can help with your specific needs.';
    }
  }

  private async findOrCreateLead(dto: { visitorId: string; message: string; leadId?: string; metadata?: any }) {
    const existing = dto.leadId ? await this.prisma.lead.findUnique({ where: { id: dto.leadId } }) : null;
    if (existing) return existing;

    return this.prisma.lead.create({
      data: {
        firstName: 'Chatbot',
        lastName: 'Visitor',
        source: LeadSource.CHAT_WIDGET,
        status: LeadStatus.NEW,
        notes: `Initial message: ${dto.message}`,
      },
    });
  }
}
