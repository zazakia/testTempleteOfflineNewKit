/**
 * ─── Member UI Configuration ────────────────────────────────
 * Defines how Member entity renders in tables, forms, and details.
 */

import type { Member } from './member.schema'
import { MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_COLORS, MEMBERSHIP_TYPE_LABELS, CIVIL_STATUS_LABELS } from './member.schema'

export interface ColumnDef<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  width?: string
}

export interface FormFieldDef {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'url' | 'select' | 'textarea' | 'tags' | 'number' | 'date' | 'checkbox'
  placeholder?: string
  required?: boolean
  defaultValue?: string
  options?: Array<{ label: string; value: string }>
  helperText?: string
  section?: string
}

export interface DetailSectionDef {
  title: string
  fields: Array<{ label: string; key: string }>
}

export const MemberUIConfig = {
  defaultColumns: [
    { key: 'membershipNumber', label: 'Member ID', sortable: true, searchable: true, width: '140px' },
    { key: 'fullName', label: 'Full Name', sortable: true, searchable: true, width: '250px' },
    { key: 'membershipType', label: 'Type', sortable: true, filterable: true, width: '100px' },
    { key: 'membershipStatus', label: 'Status', sortable: true, filterable: true, width: '120px' },
    { key: 'barangay', label: 'Barangay', sortable: true, searchable: true, width: '150px' },
    { key: 'cityMunicipality', label: 'City/Municipality', sortable: true, width: '150px' },
    { key: 'phone', label: 'Phone', width: '140px' },
    { key: 'dateJoined', label: 'Date Joined', sortable: true, width: '120px' },
  ] satisfies ColumnDef<Member>[],

  formFields: {
    create: [
      // Personal Information
      { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Juan', section: 'Personal Information' },
      { name: 'middleName', label: 'Middle Name', type: 'text', placeholder: 'Santos', section: 'Personal Information' },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Dela Cruz', section: 'Personal Information' },
      { name: 'nameExtension', label: 'Extension', type: 'text', placeholder: 'Jr., III', section: 'Personal Information' },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'Personal Information' },
      { name: 'gender', label: 'Gender', type: 'select', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }], section: 'Personal Information' },
      { name: 'civilStatus', label: 'Civil Status', type: 'select', options: [{ label: 'Single', value: 'single' }, { label: 'Married', value: 'married' }, { label: 'Widowed', value: 'widowed' }, { label: 'Separated', value: 'separated' }], section: 'Personal Information' },

      // Contact
      { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '0917XXXXXXX', section: 'Contact' },
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'juan@email.com', section: 'Contact' },

      // Address
      { name: 'barangay', label: 'Barangay', type: 'text', placeholder: 'Barangay', section: 'Address' },
      { name: 'cityMunicipality', label: 'City/Municipality', type: 'text', placeholder: 'City', section: 'Address' },
      { name: 'province', label: 'Province', type: 'text', placeholder: 'Province', section: 'Address' },
      { name: 'zipCode', label: 'Zip Code', type: 'text', placeholder: 'XXXX', section: 'Address' },

      // Membership
      { name: 'membershipNumber', label: 'Membership Number', type: 'text', required: true, placeholder: 'COOP-2026-0001', section: 'Membership' },
      { name: 'membershipType', label: 'Membership Type', type: 'select', defaultValue: 'regular', options: [{ label: 'Regular', value: 'regular' }, { label: 'Associate', value: 'associate' }], section: 'Membership' },
      { name: 'dateJoined', label: 'Date Joined', type: 'date', section: 'Membership' },
      { name: 'pmesCompleted', label: 'PMES Completed', type: 'checkbox', section: 'Membership' },
      { name: 'pmesDate', label: 'PMES Date', type: 'date', section: 'Membership' },
      { name: 'bodResolutionNumber', label: 'BOD Resolution No.', type: 'text', placeholder: 'BR-2026-001', section: 'Membership' },
      { name: 'tinNumber', label: 'TIN Number', type: 'text', placeholder: 'XXX-XXX-XXX', section: 'Membership' },

      // Employment
      { name: 'employer', label: 'Employer', type: 'text', placeholder: 'Company Name', section: 'Employment' },
      { name: 'salary', label: 'Monthly Salary', type: 'number', placeholder: '0.00', section: 'Employment' },
      { name: 'sourceOfIncome', label: 'Source of Income', type: 'text', placeholder: 'Employment/Business', section: 'Employment' },

      // Co-maker
      { name: 'coMakerName', label: 'Co-maker', type: 'text', placeholder: 'Co-maker full name', section: 'Referral' },
    ] satisfies FormFieldDef[],
  },

  detailSections: [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Full Name', key: 'fullName' },
        { label: 'Date of Birth', key: 'dateOfBirth' },
        { label: 'Age', key: '_age' },
        { label: 'Gender', key: 'gender' },
        { label: 'Civil Status', key: 'civilStatus' },
        { label: 'Religion', key: 'religion' },
      ],
    },
    {
      title: 'Contact & Address',
      fields: [
        { label: 'Phone', key: 'phone' },
        { label: 'Email', key: 'email' },
        { label: 'Barangay', key: 'barangay' },
        { label: 'City/Municipality', key: 'cityMunicipality' },
        { label: 'Province', key: 'province' },
      ],
    },
    {
      title: 'Membership Details',
      fields: [
        { label: 'Membership Number', key: 'membershipNumber' },
        { label: 'Status', key: 'membershipStatus' },
        { label: 'Type', key: 'membershipType' },
        { label: 'Date Joined', key: 'dateJoined' },
        { label: 'PMES Completed', key: 'pmesCompleted' },
        { label: 'BOD Resolution', key: 'bodResolutionNumber' },
        { label: 'TIN Number', key: 'tinNumber' },
      ],
    },
    {
      title: 'Employment',
      fields: [
        { label: 'Employer', key: 'employer' },
        { label: 'Salary', key: 'salary' },
        { label: 'Source of Income', key: 'sourceOfIncome' },
      ],
    },
  ] satisfies DetailSectionDef[],
}
