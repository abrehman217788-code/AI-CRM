import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LeadSource, LeadStatus } from '@prisma/client';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private prisma: PrismaService) {}

  async importCsvBuffer(content: string, userId: string) {
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      throw new BadRequestException('CSV file must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const results = { imported: 0, skipped: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => { row[header] = values[idx] || ''; });

        const lead = await this.prisma.lead.create({
          data: {
            firstName: row['first name'] || row['firstname'] || row['first_name'] || 'Unknown',
            lastName: row['last name'] || row['lastname'] || row['last_name'] || 'Unknown',
            email: row['email']?.toLowerCase(),
            phone: row['phone'],
            jobTitle: row['job title'] || row['title'] || row['job_title'],
            companyId: row['company'] ? (await this.getOrCreateCompany(row['company'])).id : undefined,
            source: LeadSource.CSV_UPLOAD,
            createdById: userId,
            notes: row['notes'] || row['notes'],
          },
        });

        results.imported++;
      } catch (error: any) {
        results.errors.push(`Row ${i + 1}: ${error.message}`);
        results.skipped++;
      }
    }

    return results;
  }

  private async getOrCreateCompany(name: string) {
    let company = await this.prisma.company.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (!company) {
      company = await this.prisma.company.create({
        data: { name, domain: name.toLowerCase().replace(/\s+/g, '') + '.com' },
      });
    }

    return company;
  }
}
