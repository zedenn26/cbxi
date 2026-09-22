-- Rename the existing service without breaking enquiry foreign keys.
update public.services set
 title='IT Infrastructure Contractual Maintenance',
 slug='it-infrastructure-contractual-maintenance',
 short_description='Contractual maintenance and ongoing support for your company’s IT infrastructure and software.',
 description='Keep business operations running with a tailored infrastructure maintenance contract covering preventive maintenance, software support and technical assistance. Scope and support arrangements are agreed around your business requirements.'
where slug='it-amc-and-managed-support';
