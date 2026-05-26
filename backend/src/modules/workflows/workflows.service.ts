import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowTriggerType } from '@prisma/client';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: {
    name: string;
    description?: string;
    triggerType: WorkflowTriggerType;
    triggerConfig?: any;
    conditions?: any;
    actions?: any;
  }) {
    return this.prisma.workflow.create({ data: dto });
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.workflow.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.workflow.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    return this.prisma.workflow.findUnique({ where: { id } });
  }

  async update(id: string, dto: Partial<{
    name: string;
    description: string;
    isActive: boolean;
    triggerType: WorkflowTriggerType;
    triggerConfig: any;
    conditions: any;
    actions: any;
  }>) {
    return this.prisma.workflow.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.workflow.delete({ where: { id } });
  }

  async execute(triggerType: WorkflowTriggerType, context: any) {
    const workflows = await this.prisma.workflow.findMany({
      where: { triggerType, isActive: true },
    });

    for (const workflow of workflows) {
      try {
        if (workflow.conditions) {
          const conditions = workflow.conditions as any;
          const match = this.evaluateConditions(conditions, context);
          if (!match) continue;
        }

        const actions = workflow.actions as any[];
        for (const action of actions) {
          await this.executeAction(action, context);
        }

        await this.prisma.workflow.update({
          where: { id: workflow.id },
          data: { runCount: { increment: 1 }, lastRunAt: new Date() },
        });
      } catch (error) {
        this.logger.error(`Workflow ${workflow.id} execution failed: ${error}`);
      }
    }
  }

  private evaluateConditions(conditions: any, context: any): boolean {
    if (!conditions || !conditions.rules) return true;

    const operator = conditions.operator || 'AND';
    const results = conditions.rules.map((rule: any) => {
      const value = context[rule.field];
      switch (rule.operator) {
        case 'eq': return value === rule.value;
        case 'neq': return value !== rule.value;
        case 'gt': return Number(value) > Number(rule.value);
        case 'lt': return Number(value) < Number(rule.value);
        case 'contains': return String(value).includes(rule.value);
        default: return false;
      }
    });

    return operator === 'AND' ? results.every(Boolean) : results.some(Boolean);
  }

  private async executeAction(action: any, context: any) {
    switch (action.type) {
      case 'UPDATE_LEAD_STATUS':
        if (context.leadId) {
          await this.prisma.lead.update({
            where: { id: context.leadId },
            data: { status: action.value },
          });
        }
        break;

      case 'ASSIGN_OWNER':
        if (context.leadId && action.value) {
          await this.prisma.lead.update({
            where: { id: context.leadId },
            data: { ownerId: action.value },
          });
        }
        break;

      case 'CREATE_TASK':
        if (context.leadId && action.value) {
          await this.prisma.task.create({
            data: {
              leadId: context.leadId,
              userId: action.value.userId || context.userId,
              title: action.value.title,
              description: action.value.description,
              dueDate: action.value.dueDate ? new Date(action.value.dueDate) : null,
            },
          });
        }
        break;

      case 'SEND_NOTIFICATION':
        if (action.value.userId) {
          await this.prisma.notification.create({
            data: {
              userId: action.value.userId,
              title: action.value.title,
              message: action.value.message,
              channel: action.value.channel || 'IN_APP',
            },
          });
        }
        break;

      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }
  }
}
