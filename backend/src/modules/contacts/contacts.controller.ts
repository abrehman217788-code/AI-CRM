import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ContactsService } from './contacts.service';

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a contact for a lead' })
  create(@Body() dto: any) {
    return this.contactsService.create(dto);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get contacts by lead' })
  findByLead(@Param('leadId') leadId: string) {
    return this.contactsService.findByLead(leadId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a contact' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.contactsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
