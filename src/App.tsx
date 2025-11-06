// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from 'react';

// --- Mock Data ---
const mockHCPData = [
  // Added isDropped and isNew properties
  { id: 1, name: 'Adelaide Brown', specialty: 'Cardiology', zip: '90210', address: 'Holden Lewis, 123 Maple St', segment: 'B', plannedCalls: 5, refinedCalls: 3, priority: 'Medium', status: 'updated', comment: 'Follow up on new study.', isDropped: false, isNew: false },
  // ERROR 1: Status is 'updated' but 'Priority' is blank ('Select Priority')
  { id: 2, name: 'Elise Bennet', specialty: 'Pediatrics', zip: '10001', address: 'Ayden Woods, 456 Oak Ave', segment: 'C', plannedCalls: 4, refinedCalls: 4, priority: 'Select Priority', status: 'updated', comment: '', isDropped: false, isNew: false },
  { id: 3, name: 'James Turner', specialty: 'Cardiology', zip: '10002', address: 'Mia Clark, 789 Maple St', segment: 'B', plannedCalls: 3, refinedCalls: 3, priority: 'Medium', status: 'unchanged', comment: 'An omnichannel approach isn\'t just about being everywhere', isDropped: false, isNew: false },
  // ERROR 2: No 'A' (high-priority) segment HCPs in the plan. This one is now 'B'.
  { id: 4, name: 'Sophia Martinez', specialty: 'Neurology', zip: '10003', address: 'Liam Johnson, 234 Pine Rd', segment: 'B', plannedCalls: 5, refinedCalls: 3, priority: 'High', status: 'updated', comment: '', isDropped: false, isNew: false }, // This will now be red
  { id: 5, name: 'Noah Robinson', specialty: 'Orthopedics', zip: '10004', address: 'Olivia Lee, 123 Birch Ln', segment: 'C', plannedCalls: 4, refinedCalls: 4, priority: 'Low', status: 'unchanged', comment: '', isDropped: false, isNew: false },
  { id: 6, name: 'Emma Davis', specialty: 'Gynecology', zip: '10005', address: 'Ethan Hall, 567 Cedar Blvd', segment: 'B', plannedCalls: 2, refinedCalls: 2, priority: 'Medium', status: 'updated', comment: '', isDropped: false, isNew: false },
  { id: 7, name: 'Ava Wilson', specialty: 'Dermatology', zip: '10006', address: 'Isabella Young, 890 Spruce Ct', segment: 'C', plannedCalls: 2, refinedCalls: 2, priority: 'Low', status: 'unchanged', comment: '', isDropped: false, isNew: false },
  { id: 8, name: 'Liam Johnson', specialty: 'Cardiology', zip: '90211', address: '456 Oak St', segment: 'B', plannedCalls: 5, refinedCalls: 5, priority: 'Medium', status: 'unchanged', comment: '', isDropped: false, isNew: false },
  { id: 9, name: 'Olivia Lee', specialty: 'Pediatrics', zip: '10007', address: '789 Pine Ave', segment: 'B', plannedCalls: 3, refinedCalls: 3, priority: 'Medium', status: 'unchanged', comment: '', isDropped: false, isNew: false },
  { id: 10, name: 'Ethan Hall', specialty: 'Neurology', zip: '10008', address: '123 Maple Rd', segment: 'C', plannedCalls: 4, refinedCalls: 4, priority: 'Low', status: 'unchanged', comment: '', isDropped: false, isNew: false },
  { id: 11, name: 'Mia Clark', specialty: 'Orthopedics', zip: '10009', address: '456 Birch Ln', segment: 'B', plannedCalls: 5, refinedCalls: 2, priority: 'High', status: 'updated', comment: '', isDropped: false, isNew: false }, // This will now be red
  { id: 12, name: 'Ayden Woods', specialty: 'Gynecology', zip: '10010', address: '789 Cedar Blvd', segment: 'B', plannedCalls: 2, refinedCalls: 2, priority: 'Medium', status: 'unchanged', comment: '', isDropped: false, isNew: false },
  { id: 13, name: 'Holden Lewis', specialty: 'Dermatology', zip: '10011', address: '123 Spruce Ct', segment: 'C', plannedCalls: 3, refinedCalls: 3, priority: 'Low', status: 'unchanged', comment: '', isDropped: false, isNew: false },
  // ERROR 3: Duplicate HCP
  { id: 14, name: 'Adelaide Brown', specialty: 'Cardiology', zip: '90212', address: '123 Test St', segment: 'B', plannedCalls: 2, refinedCalls: 2, priority: 'Medium', status: 'unchanged', comment: '', isDropped: false, isNew: false },
];

// NEW Mock data for the "Add HCP" page, based on the screenshot
const mockAddHCPData = [
  { id: 201, name: 'Adelaide Brown', specialty: 'Cardiology', zip: 'Chicago', recommendedCalls: 5 },
  { id: 202, name: 'Michael Smith', specialty: 'Neurology', zip: 'Los Angeles', recommendedCalls: 7 },
  { id: 203, name: 'Sarah Johnson', specialty: 'Pediatrics', zip: 'Houston', recommendedCalls: 3 },
  { id: 204, name: 'David Williams', specialty: 'Orthopedics', zip: 'Miami', recommendedCalls: 4 },
  { id: 205, name: 'Jessica Jones', specialty: 'Dermatology', zip: 'New York City', recommendedCalls: 7 },
  { id: 206, name: 'Chris Martinez', specialty: 'Gastroenterology', zip: 'Seattle', recommendedCalls: 3 },
  { id: 207, name: 'Emily Davis', specialty: 'Psychiatry', zip: 'Columbus', recommendedCalls: 5 },
  { id: 208, name: 'Robert Garcia', specialty: 'Endocrinology', zip: 'Phoenix', recommendedCalls: 5 },
  { id: 209, name: 'Mary White', specialty: 'Cardiology', zip: 'Boston', recommendedCalls: 6 },
  { id: 210, name: 'David Lee', specialty: 'Neurology', zip: 'Austin', recommendedCalls: 4 },
  { id: 211, name: 'Linda Harris', specialty: 'Pediatrics', zip: 'Denver', recommendedCalls: 5 },
  { id: 212, name: 'James Wilson', specialty: 'Orthopedics', zip: 'San Francisco', recommendedCalls: 7 },
];


// --- UPDATED MOCK DATA FOR APPROVAL REQUESTS PAGE (to match new logic) ---
const mockApprovalRequestsData = [
  {
    id: 'reg_1',
    type: 'region',
    name: 'Illinois', // DM 'Mark' manages this region
    territoryCount: 6,
    // Parent level stats are now calculated dynamically
    territories: [
      {
        id: 'ter_1_1',
        type: 'territory',
        name: 'Chicago', // Rep 'Sarah' (rep@cpm.com / yash) manages this
        errors: 3,
        warnings: 4,
        levels: { // Pending DM
          territory: 'APPROVED',
          district: 'PENDING',
          regional: 'PENDING',
          hq: 'PENDING',
        },
        lastAccessedBy: 'Sarah (Rep001)',
        timestamp: '11 Aug 2025 11:30',
      },
      {
        id: 'ter_1_2',
        type: 'territory',
        name: 'Seattle',
        errors: 6,
        warnings: 2,
        levels: { // Pending RM
          territory: 'APPROVED',
          district: 'APPROVED',
          regional: 'PENDING',
          hq: 'PENDING',
        },
        lastAccessedBy: 'Rep002',
        timestamp: '11 Aug 2025 11:30',
      },
      {
        id: 'ter_1_3',
        type: 'territory',
        name: 'San Francisco',
        errors: 4,
        warnings: 2,
        levels: { // Pending HQ
          territory: 'APPROVED',
          district: 'APPROVED',
          regional: 'APPROVED',
          hq: 'PENDING',
        },
        lastAccessedBy: 'Rep002',
        timestamp: '12 Aug 2025 09:00',
      },
      {
        id: 'ter_1_4',
        type: 'territory',
        name: 'New York',
        errors: 5,
        warnings: 1,
        levels: { // Fully Approved
          territory: 'APPROVED',
          district: 'APPROVED',
          regional: 'APPROVED',
          hq: 'APPROVED',
        },
        lastAccessedBy: 'Rep001',
        timestamp: '13 Aug 2025 14:00',
      },
      {
        id: 'ter_1_5',
        type: 'territory',
        name: 'Austin',
        errors: 3,
        warnings: 3,
        levels: { // Not Submitted by Rep
          territory: 'PENDING',
          district: 'PENDING',
          regional: 'PENDING',
          hq: 'PENDING',
        },
        lastAccessedBy: 'Rep001',
        timestamp: '14 Aug 2025 10:15',
      },
      {
        id: 'ter_1_6',
        type: 'territory',
        name: 'Springfield',
        errors: 0,
        warnings: 1,
        levels: { // Pending DM (for bulk approve test)
          territory: 'APPROVED',
          district: 'PENDING',
          regional: 'PENDING',
          hq: 'PENDING',
        },
        lastAccessedBy: 'Rep003',
        timestamp: '14 Aug 2025 11:00',
      },
    ]
  },
  {
    id: 'reg_2',
    type: 'region',
    name: 'New England', // DM 'Mark' does NOT manage this, RM 'Rachel' does
    territoryCount: 4,
    territories: [
      {
        id: 'ter_2_1',
        type: 'territory',
        name: 'Boston',
        errors: 0,
        warnings: 0,
        levels: {
          territory: 'APPROVED',
          district: 'APPROVED',
          regional: 'APPROVED',
          hq: 'APPROVED',
        },
        lastAccessedBy: 'Rep004',
        timestamp: '11 Aug 2025 11:30',
      },
      {
        id: 'ter_2_2',
        type: 'territory',
        name: 'Portland',
        errors: 1,
        warnings: 0,
        levels: {
          territory: 'APPROVED',
          district: 'PENDING',
          regional: 'PENDING',
          hq: 'PENDING',
        },
        lastAccessedBy: 'Rep005',
        timestamp: '11 Aug 2025 11:30',
      },
    ]
  }
];


// --- SVG Icons ---

const EyeIcon = ({ slash = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    {slash ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L12 12" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    )}
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

export const DotsVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const WarningIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-yellow-500`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

export const CalendarIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.23 8.29a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
  </svg>
);

// --- NEW SORT ICON ---
const SortIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
  </svg>
);


export const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
    </svg>
);

export const ReplyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.017 5.454 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

// --- NEW XCircleIcon ---
const XCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

// --- NEW MinusCircleIcon ---
const MinusCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


export const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32 text-green-500">
    <path fillRule="evenodd" d="M12.001 2.25a.75.75 0 0 1 .75.75v1.206a13.43 13.43 0 0 1 7.234 4.016.75.75 0 0 1-.22 1.007l-7.363 5.422a.75.75 0 0 1-.69-.002l-7.363-5.422a.75.75 0 0 1-.22-1.007 13.43 13.43 0 0 1 7.234-4.016V3a.75.75 0 0 1 .75-.75Zm0 16.144a2.25 2.25 0 0 0 1.88-1.043l4.5-7.5a.75.75 0 0 0-1.316-.79l-3.834 6.39-1.88-1.88a.75.75 0 1 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 .71.263Z" clipRule="evenodd" />
    <path d="M12 21.75c-4.663 0-8.62-3.085-9.973-7.251a.75.75 0 0 1 .33-1.01l7.363-5.422a.75.75 0 0 1 .69-.002l7.363 5.422a.75.75 0 0 1 .33 1.01C20.62 18.665 16.663 21.75 12 21.75Z" />
  </svg>
);

const ExclamationCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>
);

const UserCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const PhoneIconKpi = ({ className = "w-3 h-3" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.819V19.5a3 3 0 0 1-3 3h-2.25C6.55 22.5 1.5 17.45 1.5 9.75V4.5Z" clipRule="evenodd" />
  </svg>
);

const UserPlusIconKpi = ({ className = "w-3 h-3" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM3.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63A13.007 13.007 0 0 1 10.375 21c-2.276 0-4.36-.63-6.037-1.721a.75.75 0 0 1-.363-.63l-.001-.12v-.002ZM17.25 19.125a7.123 7.123 0 0 1 1.096-3.516.75.75 0 0 1 1.309.615 8.623 8.623 0 0 0-1.87 4.19.75.75 0 0 1-1.423-.396v-.002ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25h-2.25a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25h2.25a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
  </svg>
);

const UserMinusIconKpi = ({ className = "w-3 h-3" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM3.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63A13.007 13.007 0 0 1 10.375 21c-2.276 0-4.36-.63-6.037-1.721a.75.75 0 0 1-.363-.63l-.001-.12v-.002ZM17.25 19.125a7.123 7.123 0 0 1 1.096-3.516.75.75 0 0 1 1.309.615 8.623 8.623 0 0 0-1.87 4.19.75.75 0 0 1-1.423-.396v-.002ZM16.5 9.75a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-6Z" />
  </svg>
);


const GridIcon = ({ active = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${active ? 'text-green-500' : 'text-gray-500'}`}>
    {active ? (
      <path d="M6 3a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6Zm12 0a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-3ZM6 15a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3H6Zm12 0a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3h-3Z" />
    ) : (
      <path fill="none" strokeWidth={1.5} stroke="currentColor" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6A2.25 2.25 0 0 1 15.75 3.75h2.25A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75A2.25 2.25 0 0 1 15.75 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    )}
  </svg>
);

// --- NEW PlusCircleIcon FOR SIDEBAR ---
const PlusCircleIconSidebar = ({ active = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${active ? 'text-green-500' : 'text-gray-500'}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


const DocumentTextIcon = ({ active = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${active ? 'text-green-500' : 'text-gray-500'}`}>
    {active ? (
      <path fillRule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v14.25C1.5 20.16 2.34 21 3.375 21h17.25c1.035 0 1.875-.84 1.875-1.875V7.594c0-.526-.21-1.03-.58-1.407l-4.5-4.5a2.022 2.022 0 0 0-1.41-.587H3.375Zm6 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 3a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3-3a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 3a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3-3a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 3a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm9-3.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 3a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm3-3a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 3a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
    ) : (
      <path fill="none" strokeWidth={1.5} stroke="currentColor" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    )}
  </svg>
);

// --- NEW Icon for "Reps Dashboard" ---
const UsersIcon = ({ active = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${active ? 'text-green-500' : 'text-gray-500'}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.584M14.25 1.5v1.5M14.25 9.75v1.5M14.25 18v1.5M18.75 5.995a18.02 18.02 0 0 1 2.21-1.353M18.75 15.995a18.02 18.02 0 0 0 2.21-1.353m-15.015-1.353a18.02 18.02 0 0 1-2.21-1.353M6.75 5.995a18.02 18.02 0 0 0-2.21-1.353m15.015 1.353a18.02 18.02 0 0 1 2.21 1.353M6.75 15.995a18.02 18.02 0 0 0 2.21 1.353m-15.015-1.353a18.02 18.02 0 0 1-2.21 1.353M9 1.5v1.5M9 9.75v1.5M9 18v1.5m-3.005-6.005a18.02 18.02 0 0 1-2.21-1.353M15.005 15.995a18.02 18.02 0 0 0 2.21 1.353M15.005 5.995a18.02 18.02 0 0 1 2.21-1.353M9.005 15.995a18.02 18.02 0 0 0-2.21 1.353M9.005 5.995a18.02 18.02 0 0 1-2.21-1.353M3 9.75a8.96 8.96 0 0 1 3.23-6.62M3 9.75a8.96 8.96 0 0 0 3.23 6.62M15 9.75a8.96 8.96 0 0 1 3.23 6.62M15 9.75a8.96 8.96 0 0 0 3.23-6.62M3.75 9.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm11.25 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-3.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-3.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);


const QuestionMarkCircleIcon = ({ active = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${active ? 'text-green-500' : 'text-gray-500'}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
);

const PhoneIcon = ({ active = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${active ? 'text-green-500' : 'text-gray-500'}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 6.086a.75.75 0 0 1-.397 1.026l-1.12.373a11.91 11.91 0 0 0-1.12 10.337.75.75 0 0 1-1.314.453 11.91 11.91 0 0 1-2.03-1.077c-.4-.252-.817-.48-1.246-.685a.75.75 0 0 0-.6-.01l-1.062.425a.75.75 0 0 1-.91-.869 11.91 11.91 0 0 1 .49-3.26c.078-.501.122-1.009.122-1.524 0-.515-.044-1.023-.122-1.524a11.91 11.91 0 0 1-.49-3.26.75.75 0 0 1 .91-.869l1.062.425a.75.75 0 0 0 .6-.01c.429-.205.846-.433 1.246-.685a11.91 11.91 0 0 1 2.03-1.077.75.75 0 0 1 1.314.453 11.91 11.91 0 0 0 1.12 10.337l1.12.373a.75.75 0 0 1 .397 1.026ZM16.5 9.75a4.5 4.5 0 0 1-4.5 4.5M16.5 9.75a4.5 4.5 0 0 0-4.5-4.5" />
  </svg>
);

const BuildingOfficeIcon = ({ active = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${active ? 'text-green-500' : 'text-gray-500'}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const LogoutIcon = ({ active = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${active ? 'text-green-500' : 'text-gray-500'}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);


const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5">
    <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 1 10 6H4.75A1.25 1.25 0 0 0 3.5 7.25v7.5A1.25 1.25 0 0 0 4.75 16h7.5A1.25 1.25 0 0 0 13.5 14.75v-3.5a.75.75 0 0 1 1.5 0v3.5A2.75 2.75 0 0 1 12.25 17.5h-7.5A2.75 2.75 0 0 1 2 14.75v-7.5A2.75 2.75 0 0 1 4.75 4.5h3.5a.75.75 0 0 1 0 1.5h-3.5c-.69 0-1.25.56-1.25 1.25v.006Z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);

// --- UPDATED TRASH ICON ---
const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.576 0c-.34.055-.68.11-.1.022.165m10.963 0-1.14.041m-11.755 0L7.752 5.79m7.304 0L12 5.79m-2.248 0L9.26 5.79" />
  </svg>
);

// --- NEW RE-ADD ICON ---
const PlusCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


// --- NEW BACK ARROW ICON ---
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

// --- NEW ICONS FOR DETAIL PAGE ---
export const EnvelopeIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const PhoneIconDetail = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.211-.996-.58-1.356l-2.4-2.4a.75.75 0 0 0-1.06 0l-1.97 1.97a11.25 11.25 0 0 1-5.23-5.23l1.97-1.97a.75.75 0 0 0 0-1.06l-2.4-2.4a.75.75 0 0 0-1.356-.58V4.5A2.25 2.25 0 0 0 4.5 2.25H2.25Z" />
  </svg>
);

const AcademicCapIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
  </svg>
);

const IdentificationIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.375 6.375a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h11.25a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H6.375ZM6.375 6.375V3.375c0-.621.504-1.125 1.125-1.125h11.25c.621 0 1.125.504 1.125 1.125v3M6.375 6.375A3 3 0 0 1 9.375 3.375h5.25A3 3 0 0 1 17.625 6.375m0 0v3.375c0 .621-.504 1.125-1.125 1.125h-5.25A3 3 0 0 1 8.25 9.75V6.375m9.375 0c.621 0 1.125.504 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125h-1.5c-.621 0-1.125-.504-1.125-1.125V7.5c0-.621.504-1.125 1.125-1.125h1.5Zm-9.375 0c.621 0 1.125.504 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125h-1.5c-.621 0-1.125-.504-1.125-1.125V7.5c0-.621.504-1.125 1.125-1.125h1.5Z" />
  </svg>
);

const ClipboardDocumentIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const MapPinIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);


// --- NEW Pagination Icons ---
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

// --- NEW ICONS FOR APPROVAL BUTTONS ---
const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
// --- END NEW ICONS ---

// --- NEW SPINNER ICON ---
const SpinnerIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} animate-spin`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.181m0-4.991v4.991m0 0h-4.99M16.023 9.348a4.5 4.5 0 0 1-8.777-2.182m-1.938 5.433a4.5 4.5 0 0 1 2.182-8.777m7.5 0a4.5 4.5 0 0 1 8.777 2.182m1.938-5.433a4.5 4.5 0 0 1-2.182 8.777m-7.5 0a4.5 4.5 0 0 1-8.777-2.182m-1.938 5.433a4.5 4.5 0 0 1 2.182-8.777m7.5 0a4.5 4.5 0 0 1 8.777 2.182m1.938-5.433a4.5 4.5 0 0 1-2.182 8.777" />
  </svg>
);


// --- Helper function for pagination
const range = (start: number, end: number): number[] => {
  let length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

// --- NEW Pagination Component ---
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const siblingCount = 1;

  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5; // siblingCount + firstPage + lastPage + currentPage + 2*DOTS

    // Case 1: Total pages is less than the numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      if (leftItemCount > totalPages) leftItemCount = totalPages; // handle edge case
      let leftRange = range(1, leftItemCount);
      return [...leftRange, '...', totalPages];
    }

    // Case 3: No right dots, but left dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      if (rightItemCount > totalPages) rightItemCount = totalPages; // handle edge case
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, '...', ...rightRange];
    }

    // Case 4: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
    return range(1, totalPages); // Fallback
  }, [currentPage, totalPages, siblingCount]);

  if (currentPage === 0 || totalPages <= 1) {
    return null;
  }

  const onNext = () => onPageChange(currentPage + 1);
  const onPrevious = () => onPageChange(currentPage - 1);

  return (
    <nav className="flex-shrink-0 flex justify-center items-center gap-2 mt-2">
      <button 
        onClick={onPrevious} 
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-200 text-gray-500 disabled:opacity-50"
      >
        <ChevronLeftIcon />
      </button>
      
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === '...') {
          return <span key={index} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-700">...</span>;
        }

        return (
          <button 
            key={index}
            onClick={() => typeof pageNumber === 'number' && onPageChange(pageNumber)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg font-semibold transition-colors ${
              (typeof pageNumber === 'number' && currentPage === pageNumber) 
                ? 'bg-blue-600 text-white border border-blue-600' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button 
        onClick={onNext} 
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-200 text-gray-500 disabled:opacity-50"
      >
        <ChevronRightIcon />
      </button>
    </nav>
  );
};


// --- NEW Tooltip Component (UPDATED) ---
interface TooltipProps {
  text?: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  if (!text) {
    return <>{children}</>;
  }
  return (
    <div className="relative group flex justify-center">
      {children}
      {/* Tooltip pops out to the left. `right-full` positions it to the left of the child. `mr-2` adds space. */}
      {/* `top-1/2 -translate-y-1/2` centers it vertically. */}
      {/* `max-w-xs` constrains the width, `whitespace-normal` allows wrapping. */}
      <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 max-w-xs px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-normal">
        {text}
        {/* Arrow on the right side of the tooltip, pointing right */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-gray-800"></div>
      </div>
    </div>
  );
};


interface LoginPageProps { onLogin: (role: string, name: string) => void }

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Mock authentication - Re-verified this logic
    if ((email === 'rep@cpm.com' && password === '123') || (email === 'yash' && password === 'abcd')) {
      onLogin('rep', 'Sarah'); // Rep: 'Sarah'
    } else if (email === 'dm@cpm.com' && password === '123') {
      onLogin('dm', 'Mark'); // DM: 'Mark'
    } else if (email === 'rm@cpm.com' && password === '123') {
      onLogin('rm', 'Rachel'); // NEW: RM 'Rachel'
    } else {
      setError('Invalid email or password. Use rep@cpm.com (pw: 123), yash (pw: abcd), dm@cpm.com (pw: 123), or rm@cpm.com (pw: 123)');
    }
  };

  return (
    <div className="flex w-full h-screen font-sans">
      
      {/* --- Form Section (Left) --- */}
      <div className="flex-shrink-0 w-full md:w-1/2 lg:w-[40%] bg-white p-8 md:p-12 lg:p-20 flex flex-col justify-between">
        
        <div className="flex items-center text-2xl font-bold text-[#45b880]">
          <span className="w-3.5 h-3.5 bg-[#45b880] rounded-full mr-2.5"></span>
          CPM
        </div>

        <div className="w-full max-w-sm mx-auto my-auto">
          <h1 className="text-4xl font-medium text-[#45b880] mb-2">Welcome!</h1>
          <p className="text-gray-500 mb-8">Please enter your details</p>

          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Email ID</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@email.com" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#45b880]" 
                required 
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#45b880]" 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 cursor-pointer"
                >
                  <EyeIcon slash={showPassword} />
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#45b880] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#3da470] transition duration-300">
              Sign In
            </button>
          </form>
        </div>

        <div className="h-12">
          {/* Footer placeholder */}
        </div>
      </div>

      {/* --- Graphic Section (Right) --- */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#f8fefb] to-[#effaf5] relative items-center justify-center overflow-hidden">
        <div className="relative w-56 h-56">
          
          {/* 2. The horizontal line - invisible */}
          <div className="absolute top-1/2 left-[-50%] right-[-50%] h-px bg-black bg-opacity-0 z-10"></div>
          
          {/* Solid top half */}
          <div 
            className="absolute top-0 left-0 w-full h-full bg-[#45b880] rounded-full z-20"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
          ></div>

          {/* 1. Blurred bottom reflection - set to 75% opacity */}
          <div 
            className="absolute top-0 left-0 w-full h-full bg-[#45b880] rounded-full z-0 opacity-75"
            style={{ 
              filter: 'blur(25px)',
            }}
          ></div>
        </div>
      </div>

    </div>
  );
};

// --- THIS PAGE IS NO LONGER USED BY DM, but is kept for potential future roles ---
interface TerritorySelectionPageProps {
  onSelectTerritory: (name: string) => void;
  onNavigate: (page: string) => void;
  userRole: string;
}

export const TerritorySelectionPage: React.FC<TerritorySelectionPageProps> = ({ onSelectTerritory, onNavigate, userRole }) => {
  const territories = [
    'Augusta, ME',
    'Bangor, ME',
    'Concord, NH',
    'Manchester, NH',
    'Portland, ME',
    'ONC_BC_A - Ann Arbor MI 1-20...',
    'ONC_BC_A - Atlanta N GA 1-201...',
    'ONC_BC_A - Atlanta S GA 1-201...',
    'ONC_BC_A - Austin TX 1-201114...',
    'ONC_BC_A - Baltimore MD 1-20...',
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Welcome, Manager</h1>
      <div className="flex gap-8">
        <div className="w-1/3 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Select Territory</h2>
          <div className="relative mb-2">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-4 pr-10 py-2 border rounded-md" 
            />
            <span className="absolute right-3 top-2.5 text-gray-400">
              <SearchIcon />
            </span>
          </div>
          <div className="overflow-y-auto h-96 border rounded-md">
            {territories.map((name, index) => (
              <div 
                key={index}
                onClick={() => onSelectTerritory(name)}
                className="p-3 hover:bg-orange-100 cursor-pointer border-b last:border-b-0"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
        <div className="w-2/3">
          <p className="text-lg mb-4">Select a territory to review its call plan.</p>
          {userRole === 'dm' && (
            <button
              onClick={() => onNavigate('approvalRequests')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
            >
              Go to Approval Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- UPDATED SIDEBAR ---
interface SidebarProps {
  onLogout: () => void;
  userRole: string;
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, userRole, activePage, onNavigate }) => {
  
  const NavItem: React.FC<{ icon: React.ReactNode; label: string; pageName: string; isActive: boolean; onNavigate: (p: string) => void }> = ({ icon, label, pageName, isActive, onNavigate }) => {
    return (
      <button 
        onClick={() => onNavigate(pageName)}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
          isActive 
            ? 'bg-green-50 text-green-600 font-semibold' 
            : 'text-gray-600 font-medium hover:bg-gray-50'
        } ${
          // Center icon when collapsed (group-hover:justify-start is in parent)
          'justify-center group-hover:justify-start'
        }`}
      >
        <div className="flex-shrink-0 w-5 h-5">{icon}</div>
        <span className="hidden group-hover:inline whitespace-nowrap">{label}</span>
      </button>
    );
  };
  
  return (
    <div className="group fixed top-4 left-4 h-[calc(100vh-2rem)] w-16 hover:w-64 bg-white flex flex-col justify-between py-6 px-4 shadow-xl z-30 transition-all duration-300 ease-in-out overflow-hidden rounded-2xl">
      {/* Top Section */}
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 h-10 justify-center group-hover:justify-start">
           {/* --- IMPROVED LOGO --- */}
           <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center relative">
             <div className="w-5 h-5 bg-green-500 rounded-sm transform rotate-45 absolute"></div>
             <div className="w-5 h-5 bg-green-700 rounded-sm transform rotate-45 absolute opacity-75 translate-x-1 translate-y-1"></div>
           </div>
           {/* --- END LOGO --- */}
           <span className="font-bold text-xl text-green-500 hidden group-hover:inline whitespace-nowrap">CPM</span>
        </div>
        
        {/* Nav Icons - Now Role-Based */}
        <nav className="flex flex-col gap-2">
          {userRole === 'rep' && (
            <>
              <NavItem 
                icon={<GridIcon active={activePage === 'dashboard'} />} 
                label="Dashboard" 
                pageName="dashboard"
                isActive={activePage === 'dashboard'}
                onNavigate={onNavigate}
              />
              <NavItem 
                icon={<PlusCircleIconSidebar active={activePage === 'addHCP'} />} 
                label="Add HCP" 
                pageName="addHCP"
                isActive={activePage === 'addHCP'}
                onNavigate={onNavigate}
              />
            </>
          )}
          
          {['dm', 'rm'].includes(userRole) && (
             <>
                <NavItem 
                  icon={<DocumentTextIcon active={activePage === 'approvalRequests'} />} 
                  label="Approval Requests" 
                  pageName="approvalRequests"
                  isActive={activePage === 'approvalRequests'}
                  onNavigate={onNavigate}
                />
                <NavItem 
                  icon={<UsersIcon active={activePage === 'dashboard'} />} 
                  label="Reps Dashboard" 
                  pageName="dashboard"
                  isActive={activePage === 'dashboard'}
                  onNavigate={onNavigate}
                />
             </>
          )}
        </nav>
      </div>
      
      {/* Bottom Icons */}
      <div className="flex flex-col gap-2">
         <NavItem 
            icon={<QuestionMarkCircleIcon />} 
            label="Help" 
            pageName="help"
            isActive={activePage === 'help'}
            onNavigate={onNavigate}
          />
         <NavItem 
            icon={<PhoneIcon />} 
            label="Contact Us" 
            pageName="contact"
            isActive={activePage === 'contact'}
            onNavigate={onNavigate}
          />
         <NavItem 
            icon={<BuildingOfficeIcon />} 
            label="Company Policy" 
            pageName="policy"
            isActive={activePage === 'policy'}
            onNavigate={onNavigate}
          />
         <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-gray-600 font-medium hover:bg-gray-50 justify-center group-hover:justify-start"
         >
            <div className="flex-shrink-0 w-5 h-5"><LogoutIcon /></div>
            <span className="hidden group-hover:inline whitespace-nowrap">Log out</span>
         </button>
      </div>
    </div>
  );
};
// --- END REFACTORED SIDEBAR ---

// FilterDropdown Component used by Dashboard and new AddHCPPage
interface FilterDropdownProps {
  label: string;
  options: string[];
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, className = "w-64", value, onChange }) => (
  <div className="flex-shrink-0 mr-2">
    <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={onChange}
        className={`${className} bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#45b880] text-gray-500`}
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

// --- NEW FilterInput Component ---
interface FilterInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const FilterInput: React.FC<FilterInputProps> = ({ label, value, onChange, placeholder }) => (
  <div className="flex-shrink-0 mr-2">
    <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
    <div className="relative">
      <input 
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-64 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#45b880] text-gray-500"
      />
      <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
    </div>
  </div>
);


// --- NEW Delete Confirmation Modal ---
interface DeleteConfirmationModalProps {
  onCancel: () => void;
  onConfirm: (reason: string | null) => void;
  isSubmitting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onCancel, onConfirm, isSubmitting }) => {
  const [reason, setReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const reasons = ['Moved', 'Retired', 'Deceased', 'Inactive', 'Others'];

  const showOtherReasonText = reason === 'Others';
  const canConfirm = reason && (reason !== 'Others' || (reason === 'Others' && otherReason.trim() !== ''));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center p-4">
      <div 
        className={`bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl transition-all duration-300 ${showOtherReasonText ? 'h-auto sm:h-[380px]' : 'h-auto sm:h-[250px]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Are you sure you want to delete this Customer Call Plan?</h2>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Reason to Delete</label>
          <div className="flex flex-wrap gap-3 mb-4">
              {reasons.map((r: string) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                className={`py-2 px-5 rounded-lg text-sm font-medium border-2 transition-colors ${
                  reason === r 
                    ? 'bg-green-100 text-green-700 border-green-500' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Conditional Text Area */}
          <div className={`transition-all duration-300 overflow-hidden ${showOtherReasonText ? 'max-h-40' : 'max-h-0'}`}>
            <textarea
              placeholder="Add other reason"
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              className="w-full h-24 p-2 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="py-2 px-5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const finalReason = reason === 'Others' ? otherReason : reason;
              onConfirm(finalReason);
            }}
            disabled={isSubmitting || !canConfirm}
            className="py-2 px-5 bg-white text-red-600 border border-red-500 rounded-lg font-medium hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <SpinnerIcon />}
            {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- RE-INTRODUCED Error/Warning Modal (REDESIGNED) ---
type ErrorItem = { id: any; name: string; message: string };
type Hcp = { id: any; name: string; plannedCalls: number; refinedCalls: number; isNew?: boolean; isDropped?: boolean; priority?: string; status?: string; segment?: string; zip?: string; specialty?: string; comment?: string };
interface ErrorWarningModalProps {
  onClose: () => void;
  errors: ErrorItem[];
  warnings: string[];
  onHighlightRow: (id: any) => void;
}

const ErrorWarningModal: React.FC<ErrorWarningModalProps> = ({ onClose, errors, warnings, onHighlightRow }) => {
  const [activeTab, setActiveTab] = useState('errors'); // 'errors' or 'warnings'
  
  // Group errors
  const groupedErrors = useMemo<Record<string, ErrorItem[]>>(() => {
    const acc: Record<string, ErrorItem[]> = {};
    for (const error of errors) {
      let messageKey: string;
      if (error.message.startsWith('Duplicate HCP:')) {
        messageKey = 'Duplicate HCP';
      } else {
        messageKey = error.message.split(':')[0];
      }
      
      if (!acc[messageKey]) {
        acc[messageKey] = [];
      }
      acc[messageKey].push(error);
    }
    return acc;
  }, [errors]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('errors')}
            className={`py-3 px-5 text-sm font-semibold rounded-t-lg ${
              activeTab === 'errors' 
                ? 'text-black border-b-2 border-black' 
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Errors
          </button>
          <button
            onClick={() => setActiveTab('warnings')}
            className={`py-3 px-5 text-sm font-semibold rounded-t-lg ${
              activeTab === 'warnings' 
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Warnings
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto pr-2">
          {activeTab === 'errors' ? (
            <div className="space-y-4">
              {errors.length > 0 ? (
                <ol className="list-decimal list-outside ml-5 space-y-4">
                  {Object.entries(groupedErrors).map(([messageKey, hcpErrors]) => (
                    <li key={messageKey} className="text-sm pl-2">
                      <span className="font-semibold text-gray-800">{messageKey}:</span>
                      
                      {/* Single Error */}
                      {hcpErrors.length === 1 ? (
                        <div 
                          onClick={() => onHighlightRow(hcpErrors[0].id)}
                          className="text-gray-700 hover:text-black hover:bg-gray-50 rounded-md p-2 cursor-pointer transition-colors mt-1"
                        >
                          {hcpErrors[0].name === 'Global' ? (
                            <span className="font-medium">{hcpErrors[0].message.split(':')[1]?.trim() || hcpErrors[0].message}</span>
                          ) : (
                            <>
                              <span>{hcpErrors[0].name}</span>
                              {messageKey === 'Duplicate HCP' ? 
                                <span className="text-gray-500 italic ml-1">({hcpErrors[0].message.split(':')[1].trim()})</span> :
                                (hcpErrors[0].message.includes(':') && hcpErrors[0].message.split(':')[1].trim() !== '') ? 
                                <span className="text-gray-500 ml-1">({hcpErrors[0].message.split(':')[1].trim()})</span> : 
                                ''
                              }
                            </>
                          )}
                        </div>
                      ) : (
                        /* Multiple Errors */
                        <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
                          {hcpErrors.map((error, index) => (
                            <li 
                              key={index} 
                              onClick={() => onHighlightRow(error.id)}
                              className="text-gray-700 hover:text-black hover:bg-gray-50 rounded-md p-2 cursor-pointer transition-colors"
                            >
                              {error.name === 'Global' ? (
                                <span className="font-medium">{error.message.split(':')[1]?.trim() || error.message}</span>
                              ) : (
                                <>
                                  <span>{error.name}</span>
                                  {messageKey === 'Duplicate HCP' ? 
                                    <span className="text-gray-500 italic ml-1">({error.message.split(':')[1].trim()})</span> :
                                    (error.message.includes(':') && error.message.split(':')[1].trim() !== '') ? 
                                    <span className="text-gray-500 ml-1">({error.message.split(':')[1].trim()})</span> : 
                                    ''
                                  }
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-600">No errors found.</p>
              )}
              <p className="text-red-600 font-medium mt-6 text-sm">
                Please note that you'll not be able to submit, unless all the error points have been cleared.
              </p>
            </div>
          ) : (
            <div>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 text-sm">
                {warnings.length > 0 ? (
                  warnings.map((item, index) => <li key={index}>{item}</li>)
                ) : (
                  <li className="list-none text-gray-600">No warnings found.</li>
                )}
              </ol>
            </div>
          )}
        </div>
        
        {/* Close Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NEW Warning Confirmation Modal ---
interface WarningConfirmationModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

const WarningConfirmationModal: React.FC<WarningConfirmationModalProps> = ({ onCancel, onConfirm, isSubmitting }) => (
  <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm text-center">
      <ExclamationCircleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 mb-4">You have unresolved warnings.</h2>
      <p className="text-gray-600 mb-6">Proceed anyway?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="py-2 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="py-2 px-6 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting && <SpinnerIcon />}
          {isSubmitting ? 'Submitting...' : 'Proceed'}
        </button>
      </div>
    </div>
  </div>
);

// --- NEW REJECTION MODAL ---
interface RejectionModalProps {
  onCancel: () => void;
  onConfirm: (comment: string) => void;
}

const RejectionModal: React.FC<RejectionModalProps> = ({ onCancel, onConfirm }) => {
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false); // To prevent double-submit
  const canSubmit = comment.trim() !== '';

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onConfirm(comment);
      // No need to set submitting false, modal will close
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Reject Plan</h2>
        <p className="text-sm text-gray-600 mb-6">
          Please provide a comment for the rejection. This will be sent to the Rep so they can make the required changes.
        </p>
        
        <div>
          <label htmlFor="rejectionComment" className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Comment (Required)
          </label>
          <textarea
            id="rejectionComment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="e.g., 'Please add Dr. Smith (Seg A) to the plan and revise call numbers for cardiology...'"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="py-2 px-5 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="py-2 px-5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <SpinnerIcon />}
            {isSubmitting ? 'Submitting...' : 'Submit Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- NEW Empty State Component ---
const EmptyState = ({ title = "No HCPs Found", message = "Try adjusting your filters or add a new HCP to the plan." }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-10">
    <SearchIcon className="w-16 h-16 text-gray-300" />
    <h3 className="text-xl font-semibold text-gray-700 mt-4">{title}</h3>
    <p className="text-gray-500 mt-1">{message}</p>
  </div>
);


// --- NEW Header with Profile Dropdown ---
interface AppHeaderProps {
  onLogout: () => void;
  userName: string;
  userRole: string;
  title: string;
  onBack?: () => void;
  onNavigate: (page: string) => void;
  pageName?: string;
  activeTerritory?: string;
  territories?: string[];
  onSetTerritory?: (t: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  onLogout, 
  userName, // NEW: 'Sarah' or 'Mark'
  userRole, 
  title, 
  onBack, 
  onNavigate,
  // --- NEW PROPS for Territory Switcher ---
  pageName, // 'dashboard', 'approvalRequests', etc.
  activeTerritory,
  territories = [], // List of territories for the dropdown
  onSetTerritory // Function to call when dropdown changes
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const roleNames: Record<string, string> = {
    rep: 'Sales Rep',
    dm: 'District Manager',
    rm: 'Regional Manager',
    hq: 'HQ',
  };
  
  const userRoleName = roleNames[userRole] || 'User';

  // Mock notifications based on role
  const notifications: Record<string, { id: number; type: string; message: string }[]> = {
    rep: [
      { id: 4, type: 'success', message: 'Your plan has been successfully submitted to DMartin.' },
      { id: 1, type: 'hq', message: 'Plan approved by HQ. You may begin execution.' },
      { id: 2, type: 'error', message: 'Error: Missing call frequency for Dr. Elise Bennet.' },
      { id: 3, type: 'warning', message: 'Warning: You planned fewer calls than recommended for Tier 1 HCPs.' },
    ],
    dm: [
      { id: 1, type: 'rep', message: 'Your territory rep Sarah (Rep001) has submitted a call plan for review.' },
      { id: 2, type: 'dm', message: 'Plan approved and forwarded to Regional Manager.' },
    ],
    rm: [
      { id: 2, type: 'dm', message: 'DMartin has approved a plan. It is ready for your review.' },
      { id: 1, type: 'rm', message: 'Plan approved and forwarded to HQ.' },
    ],
    hq: [
      { id: 1, type: 'rm', message: 'RManager has approved a plan. It is ready for final review.' }
    ]
  };
  
  const userNotifications = notifications[userRole] || [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef, notificationRef]);
  
  // --- NEW: Territory Switcher Logic ---
  const renderHeaderTitle = () => {
    // DM on the "Reps Dashboard" page
    if (['dm', 'rm'].includes(userRole) && pageName === 'dashboard') {
      return (
        <div className="flex items-center gap-3">
          <label htmlFor="territory-switcher" className="text-sm font-semibold text-gray-700">Select Territory:</label>
          <div className="relative">
            <select 
              id="territory-switcher"
              value={activeTerritory}
              onChange={(e) => onSetTerritory(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold appearance-none focus:outline-none focus:ring-1 focus:ring-[#45b880] text-gray-700"
            >
              {territories.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      );
    }
    
    // Default title for everyone else
    return <h1 className="text-xl font-bold text-gray-900">{title}</h1>;
  };

  return (
    <header className="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        {onBack && ( // Conditionally render back button
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeftIcon />
            <span>Dashboard</span>
          </button>
        )}
        {renderHeaderTitle()} {/* <-- UPDATED to render title or switcher */}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setNotificationOpen(o => !o)}
            className="relative text-gray-400 hover:text-gray-600 p-2"
          >
            <BellIcon />
            {userNotifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          {/* Notification Dropdown */}
          {notificationOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-40 overflow-hidden">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold text-gray-800">Notifications</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {userNotifications.length > 0 ? (
                  userNotifications.map(notif => (
                    <div key={notif.id} className="px-4 py-3 border-b hover:bg-gray-50 last:border-b-0">
                      <p className={`text-xs ${
                        notif.type === 'error' ? 'text-red-600' :
                        notif.type === 'warning' ? 'text-yellow-600' :
                        notif.type === 'success' ? 'text-green-600' :
                        'text-gray-700'
                      }`}>
                        {notif.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center">
                    <p className="text-sm text-gray-500">No new notifications</p>
                  </div>
                )}
              </div>
              <div className="px-4 py-2 bg-gray-50 border-t text-center">
                <button 
                  onClick={() => onNavigate('notifications')}
                  className="text-xs font-medium text-green-600 hover:underline"
                >
                  View all
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(o => !o)} className="flex items-center gap-2 cursor-pointer">
            <img 
              src={`https://placehold.co/40x40/3B82F6/FFFFFF?text=${userName.charAt(0)}`} 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-gray-300" 
            />
            <div className="text-left">
              <div className="font-semibold text-sm text-gray-800">{userName}</div>
              <div className="text-xs text-gray-500">{userRoleName}</div>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-40 overflow-hidden">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userRoleName}</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <LogoutIcon active={false} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


interface TerritoryDashboardPageProps {
  onNavigate: (p: string) => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
  activeTerritory?: string;
  territories?: string[];
  onSetTerritory?: (t: string) => void;
  hcpData: Hcp[];
  setHcpData: React.Dispatch<React.SetStateAction<Hcp[]>>;
  onViewHcpDetail: (id: any) => void;
  activePage?: string;
}

const TerritoryDashboardPage: React.FC<TerritoryDashboardPageProps> = ({ 
  onNavigate, 
  onLogout, 
  userName, // NEW
  userRole, 
  activeTerritory, // NEW: The currently viewed territory
  territories = [], // NEW: List of territories for switcher
  onSetTerritory, // NEW: Function to change territory
  hcpData, 
  setHcpData, 
  onViewHcpDetail, 
  activePage 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false); // For spinners
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hcpToDeleteId, setHcpToDeleteId] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  // const [showWarningModal, setShowWarningModal] = useState(false); // No longer needed
  const [showSubmitWarningModal, setShowSubmitWarningModal] = useState(false);
  type SortConfig = { key: keyof Hcp; direction: 'ascending' | 'descending' } | null;
  const [sortConfig, setSortConfig] = useState<SortConfig>(null); 
  const [highlightedRowId, setHighlightedRowId] = useState(null); // For error highlighting
  const PAGE_SIZE = 10;
  
  // --- Filter States ---
  const [nameFilter, setNameFilter] = useState('');
  const [zipFilter, setZipFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('Select Specialty');
  const [priorityFilter, setPriorityFilter] = useState('Select Priority');

  
  // --- NEW Business Logic Calculations ---
  
  // 1. Calculate KPIs dynamically
  const kpis = useMemo(() => {
    // --- This logic is now updated based on your KPI table ---
    
    // Total Recommended Calls: Sum of system-suggested calls (plannedCalls) from original list (non-new)
    const totalRecommendedCalls = hcpData
      .filter((hcp: Hcp) => !hcp.isNew)
      .reduce((acc: number, hcp: Hcp) => acc + hcp.plannedCalls, 0);

    const errorsList = [];
  const activeHCPs = hcpData.filter((hcp: Hcp) => !hcp.isDropped); // Checks full data
  const hcpNameCount: Record<string, number> = {};
    let totalPlannedCalls = 0; // Will be calculated below
    let hasHighPriorityHCP = false;
    const MAX_CALLS_PER_HCP = 10;
    const MIN_TOTAL_CALLS = 50;

  activeHCPs.forEach((hcp: Hcp) => {
      // Rule 1: Missing "Priority" on an updated record
      if (hcp.status === 'updated' && (hcp.priority === 'Select Priority' || hcp.priority === '')) {
        errorsList.push({ id: hcp.id, name: hcp.name, message: 'Missing priority' });
      }

      // Rule 3: Exceeding max calls
      if (hcp.refinedCalls > MAX_CALLS_PER_HCP) {
        errorsList.push({ id: hcp.id, name: hcp.name, message: `Exceeds max allowed calls: (${hcp.refinedCalls}/${MAX_CALLS_PER_HCP})` });
      }

      // Rule 4: Check for high-priority HCP (Segment A)
      if (hcp.segment === 'A') {
        hasHighPriorityHCP = true;
      }
      
      // For Rule 2 (Duplicates)
  hcpNameCount[hcp.name] = (hcpNameCount[hcp.name] || 0) + 1;
      
      // Total Planned Calls: Sum of user-entered calls (refinedCalls) from active HCPs
      totalPlannedCalls += hcp.refinedCalls;
    });

    // Rule 2: Check for duplicates
    for (const name in hcpNameCount) {
      if (hcpNameCount[name] > 1) {
        // Find *first* HCP with this name to attach an ID for highlighting
        const firstHcp = hcpData.find(hcp => hcp.name === name);
        errorsList.push({ 
          id: firstHcp ? firstHcp.id : null, // Use first HCP's ID for highlighting
          name: name, // The duplicate name
          message: `Duplicate HCP: Appears ${hcpNameCount[name]} times` 
        });
      }
    }
    
    // Rule 4: Final check for high-priority
    if (!hasHighPriorityHCP && activeHCPs.length > 0) {
      errorsList.push({ id: null, name: 'Global', message: "Plan is missing a high-priority 'A' segment HCP" });
    }
    
    // Rule 5: Final check for min total calls
    if (totalPlannedCalls < MIN_TOTAL_CALLS) {
      errorsList.push({ id: null, name: 'Global', message: `Minimum call requirement not met: (${totalPlannedCalls}/${MIN_TOTAL_CALLS})` });
    }

    // Total Recommended HCPs: Count of unique HCPs in recommended list (non-new)
    const totalRecommendedHCPs = hcpData.filter(hcp => !hcp.isNew).length;
    
    // Total Planned HCPs: Count of active HCPs in plan (not dropped)
    const totalPlannedHCPs = hcpData.filter(hcp => !hcp.isDropped).length;
    
    // Total Added HCPs: Count of new HCPs added by rep (isNew and not dropped)
    const totalAddedHCPs = hcpData.filter(hcp => hcp.isNew && !hcp.isDropped).length;
    
    // Dropped HCPs: Count of HCPs removed from plan (isDropped)
    const droppedHCPs = hcpData.filter(hcp => hcp.isDropped).length;
        
    // 3. Calculate Warnings (hardcoded for now)
    const warningsList = [
      "Lower than recommended calls: Some HCPs have planned calls lower than the recommendation.",
      "Skipped medium-priority HCP: Key medium-priority HCPs are not included in the plan.",
      "Exceeding total call limit by <10%: The total call plan is slightly over budget.",
    ]; 

    return {
      totalRecommendedCalls,
      totalPlannedCalls,
      totalRecommendedHCPs,
      totalPlannedHCPs,
      totalAddedHCPs,
      droppedHCPs,
      errors: errorsList.length,
      errorsList: errorsList,
      warnings: warningsList.length,
      warningsList: warningsList,
    };
  }, [hcpData]);
  
  const hasErrors = kpis.errors > 0;
  
  // --- Filtered and Sorted Data Logic ---
  const filteredData = useMemo(() => {
    // 1. Filter
    const filtered = hcpData.filter(hcp => {
      const nameMatch = nameFilter === '' || hcp.name.toLowerCase().includes(nameFilter.toLowerCase());
    const zipMatch = zipFilter === '' || (hcp.zip && hcp.zip.toLowerCase().includes(zipFilter.toLowerCase()));
      const specialtyMatch = specialtyFilter === 'Select Specialty' || hcp.specialty === specialtyFilter;
      const priorityMatch = priorityFilter === 'Select Priority' || hcp.priority === priorityFilter; // Changed from segment
      return nameMatch && zipMatch && specialtyMatch && priorityMatch;
    });
    
    // 2. Sort: Active plans first, then dropped plans
    return filtered
    
  }, [hcpData, nameFilter, zipFilter, specialtyFilter, priorityFilter]);
  
  // --- NEW Sorting Logic ---
  const sortedData = useMemo(() => {
    let sortableData = [...filteredData]; // Use the already filtered data
    
    // Helper map for priority sorting
    const priorityMap = { 'High': 1, 'Medium': 2, 'Low': 3, 'Select Priority': 4, 'Others': 5 };

    // Apply user-defined sort
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        let aVal: any = (a as any)[sortConfig.key];
        let bVal: any = (b as any)[sortConfig.key];
        
        // Special sort for priority
        if (sortConfig.key === 'priority') {
          aVal = priorityMap[aVal as string] || 99;
          bVal = priorityMap[bVal as string] || 99;
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // ALWAYS apply primary sort: Dropped items to the bottom
    sortableData.sort((a, b) => {
      if (a.isDropped === b.isDropped) return 0;
      return a.isDropped ? 1 : -1;
    });
    
    return sortableData;
  }, [filteredData, sortConfig]);
  
  const requestSort = (key: keyof Hcp) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return sortedData.slice(start, end);
  }, [currentPage, sortedData]);
  
  
  // --- NEW Delete Flow Handlers ---
  const openDeleteModal = (id: any) => {
    setHcpToDeleteId(id);
    setShowDeleteModal(true);
  };

  // This function now MARKS as dropped, doesn't delete
  const handleConfirmDelete = (deleteReason: string | null) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      if (hcpToDeleteId) {
        setHcpData(prevData => 
          prevData.map(hcp => 
            hcp.id === hcpToDeleteId ? { ...hcp, isDropped: true, status: 'updated', comment: `Dropped: ${deleteReason}` } : hcp
          )
        );
      }
      setShowDeleteModal(false);
      setHcpToDeleteId(null);
      setIsSubmitting(false);
    }, 500);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setHcpToDeleteId(null);
  };
  
  // --- NEW Re-add Handler ---
  const handleReAddHCP = (id: any) => {
    setHcpData(prevData => 
      prevData.map(hcp => 
        hcp.id === id ? { ...hcp, isDropped: false, status: 'updated' } : hcp
      )
    );
  };

  
  // Handle dropdown/comment changes
  const handleTableChange = (id: any, field: string, value: any) => {
    setHcpData(prevData =>
      prevData.map(hcp =>
        hcp.id === id ? { ...hcp, [field]: value, status: 'updated' } : hcp
      )
    );
  };
  
  // --- NEW Submission Flow ---
  const submitPlan = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      // --- NEW NOTIFICATION LOGIC ---
      console.log('--- NOTIFICATION (to Rep) ---');
      console.log(`Your plan has been successfully submitted to Mark.`); // Hardcoding DM name 'Mark'
      console.log('--- NOTIFICATION (to DM) ---');
      console.log(`Your territory rep ${userName} has submitted a call plan for review.`);
      // --- END NOTIFICATION LOGIC ---

      setIsSubmitted(true);
      setIsEditing(false);
      setShowSubmitWarningModal(false);
      setIsSubmitting(false);
      // Reset status of all 'updated' rows to 'unchanged'
      setHcpData(prevData => prevData.map(hcp => ({ ...hcp, status: 'unchanged' })));
    }, 1000);
  };

  const handleMainSubmitClick = () => {
    if (isSubmitted) { // Clicked "Un-submit"
      setIsSubmitted(false);
      setIsEditing(true);
    } else { // Clicked "Submit"
      if (hasErrors) return; // Should be disabled, but as a safeguard
      if (kpis.warnings > 0) {
        setShowSubmitWarningModal(true);
      } else {
        submitPlan();
      }
    }
  };

  // --- NEW Highlight Row ---
  const handleHighlightRow = (id) => {
    if (id === null) return; // Global error
    
    // Find index of the row in the *sorted and filtered* data
    const index = sortedData.findIndex(hcp => hcp.id === id);
    if (index === -1) return; // Not in current filter
    
    // Find the page this row is on
    const page = Math.ceil((index + 1) / PAGE_SIZE);
    
    setCurrentPage(page);
    setHighlightedRowId(id);
    setShowErrorModal(false);
  };

  // Effect to clear highlight
  useEffect(() => {
    if (highlightedRowId) {
      const timer = setTimeout(() => setHighlightedRowId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedRowId]);

  
  const KpiIconWrapper = ({ color, children }) => {
    const colorClasses = {
      blue: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
      green: 'bg-gradient-to-br from-green-400 to-green-500 text-white',
      orange: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white',
    }[color] || 'bg-gray-100 text-gray-600';
    
    return (
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-lg ${colorClasses}`}>
        {children}
      </div>
    );
  };
  
  const KpiStat = ({ title, value1, subtitle1, value2, subtitle2, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 relative transform transition-all hover:scale-105">
      {/* Text content on the left */}
      <div className="flex-1">
        <div className="text-gray-500 text-xs font-medium mb-1">{title}</div>
        <div className="flex items-center">
          {/* Value 1 */}
          <div>
            <span className="text-2xl font-bold text-gray-800">{value1}</span>
            {subtitle1 && <div className="text-[8px] text-gray-400 mt-0.5 whitespace-nowrap">{subtitle1}</div>}
          </div>
          
          {value2 && (
            <>
              {/* Divider */}
              <div className="w-px h-8 bg-gray-200 mx-3"></div>
              {/* Value 2 */}
              <div>
                <span className="text-2xl font-bold text-gray-800">{value2}</span>
                {subtitle2 && <div className="text-[8px] text-gray-400 mt-0.5 whitespace-nowrap">{subtitle2}</div>}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Icon on the right */}
      {icon && <div className="absolute top-3 right-3"><KpiIconWrapper color={color}>{icon}</KpiIconWrapper></div>}
    </div>
  );
  
  // --- RE-INTRODUCED ErrorWarningCard ---
  const ErrorWarningCard = () => (
    <div className="bg-white rounded-xl shadow-sm border-red-200 p-2 transform transition-all hover:scale-105 h-full">
       <div className="flex items-center justify-around h-full">
          {/* Errors */}
          <div className="text-center px-2">
            <div className="text-gray-500 text-xs font-medium mb-1">Errors</div>
            <span className="text-2xl font-bold text-red-600">{String(kpis.errors).padStart(2, '0')}</span>
          </div>
          
          {/* Divider */}
          <div className="w-px h-10 bg-gray-200"></div>
          
          {/* Warnings */}
          <div className="text-center px-2">
             <div className="text-gray-500 text-xs font-medium mb-1">Warnings</div>
            <span className="text-2xl font-bold text-orange-500">{String(kpis.warnings).padStart(2, '0')}</span>
          </div>
        </div>
    </div>
  );

  
  const TableDropdown = ({ options, value, onChange, disabled = false }) => (
     <div className="relative">
        <select 
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-green-400 ${disabled ? 'bg-gray-100' : ''}`}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
  );
  
  // --- NEW Clear Filters Function ---
  const clearFilters = () => {
    setNameFilter('');
    setZipFilter('');
    setSpecialtyFilter('Select Specialty');
    setPriorityFilter('Select Priority');
    setCurrentPage(1);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#d1fae5] to-[#f0fdfa] font-sans relative flex">
      <Sidebar onLogout={onLogout} userRole={userRole} activePage={activePage} onNavigate={onNavigate} />
      
      <main className="flex-1 p-6 overflow-hidden ml-24 flex flex-col">
        {/* --- Header --- */}
        <AppHeader 
          onLogout={onLogout} 
          userName={userName}
          userRole={userRole} 
          title={userRole === 'rep' ? "CPM Dashboard" : "Reps Dashboard"}
          onNavigate={onNavigate}
          // --- Props for Territory Switcher ---
          pageName={activePage}
          activeTerritory={activeTerritory}
          territories={territories}
          onSetTerritory={onSetTerritory}
        />

        {/* --- KPI Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 flex-shrink-0">
          <KpiStat 
            title="Calls" 
            value1={kpis.totalRecommendedCalls} 
            subtitle1="Total Recommended Calls"
            value2={kpis.totalPlannedCalls} 
            subtitle2="Total Planned Calls"
            icon={<PhoneIconKpi className="w-3 h-3" />} 
            color="blue" 
          />
          <KpiStat 
            title="HCPs" 
            value1={kpis.totalRecommendedHCPs} 
            subtitle1="Total Recommended HCPs"
            value2={kpis.totalPlannedHCPs} 
            subtitle2="Total Planned HCPs"
            icon={<UserCircleIcon className="w-3 h-3" />} 
            color="blue" 
          />
          <KpiStat 
            title="Total Added HCPs" 
            value1={String(kpis.totalAddedHCPs).padStart(2, '0')} 
            icon={<UserPlusIconKpi className="w-3 h-3" />} 
            color="green" 
          />
          <KpiStat 
            title="Dropped HCPs" 
            value1={String(kpis.droppedHCPs).padStart(2, '0')} 
            icon={<UserMinusIconKpi className="w-3 h-3" />} 
            color="orange" 
          />
          <button onClick={() => setShowErrorModal(true)} disabled={kpis.errors === 0 && kpis.warnings === 0} className="transform transition-all hover:scale-105">
            <ErrorWarningCard />
          </button>
        </div>

        {/* --- Filter Bar --- */}
        <div 
          className="bg-white p-3 rounded-xl shadow-sm mb-4 flex items-end border flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, #F9FEFB 0%, #F3FCF8 100%)',
            borderColor: '#45b880' // Castleton Green
          }}
        >
          <FilterInput 
            label="Customer Name" 
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Search by name..."
          />
          <FilterDropdown 
            label="Specialty" 
            options={['Select Specialty', ...new Set(hcpData.map(hcp => hcp.specialty))]} 
            className="w-64"
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          />
          <FilterDropdown 
            label="Priority" 
            options={['Select Priority', 'High', 'Medium', 'Low']} 
            className="w-64"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          />
          <FilterInput 
            label="ZIP" 
            value={zipFilter}
            onChange={(e) => setZipFilter(e.target.value)}
            placeholder="Search by zip..."
          />
          <button 
            onClick={clearFilters}
            className="ml-4 py-2 px-4 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Clear All
          </button>
        </div>

        {/* --- Approved Plans Header --- */}
        <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Approved Plans</h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setIsSubmitted(false); // Editing means it's no longer "submitted"
                }}
                disabled={isEditing}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all transform hover:-translate-y-0.5 ${
                  isEditing 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-gradient-to-r from-green-600 to-green-500 text-white border border-transparent shadow-md hover:shadow-lg'
                }`}
              >
                <EditIcon /> {isEditing ? 'Editing...' : 'Edit Plan'}
              </button>
              <button 
                onClick={() => onNavigate('addHCP')}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-600 to-green-500 text-white border border-transparent shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5"
              >
                <PlusIcon /> Add HCP
              </button>
              <button 
                onClick={handleMainSubmitClick}
                disabled={(isEditing && hasErrors) || isSubmitting} // Disable submit if editing and has errors, or if submitting
                className={`py-1.5 px-5 rounded-lg text-xs font-semibold text-white shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                  isSubmitted
                    ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600' // Green for "Un-submit"
                    : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600' // Green for "Submit"
                } ${(isEditing && hasErrors) || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting && <SpinnerIcon />}
                {isSubmitting ? 'Submitting...' : (isSubmitted ? 'Un-submit' : 'Submit')}
              </button>
            </div>
          </div>
          
        {/* --- Approved Plans Table (Scrollable) --- */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
          {paginatedData.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-green-100 sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap">HCP Name</th>
                  <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap">Specialty</th>
                  <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap">ZIP code</th>
                  <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap">Address</th>
                  <th 
                    className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap cursor-pointer hover:bg-green-200"
                    onClick={() => requestSort('segment')}
                  >
                    <div className="flex items-center gap-1">
                      Segment
                      <SortIcon className="w-4 h-4" />
                    </div>
                  </th>
                  <th 
                    className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap cursor-pointer hover:bg-green-200"
                    onClick={() => requestSort('plannedCalls')}
                  >
                    <div className="flex items-center gap-1">
                      Planned Calls
                      <SortIcon className="w-4 h-4" />
                    </div>
                  </th>
                  <th 
                    className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap cursor-pointer hover:bg-green-200"
                    onClick={() => requestSort('refinedCalls')}
                  >
                    <div className="flex items-center gap-1">
                      Refined Calls
                      <SortIcon className="w-4 h-4" />
                    </div>
                  </th>
                  <th 
                    className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap cursor-pointer hover:bg-green-200"
                    onClick={() => requestSort('priority')}
                  >
                    <div className="flex items-center gap-1">
                      Priority
                      <SortIcon className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap">
                    Comment
                  </th>
                  {isEditing && <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap">Action</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((hcp) => (
                  <tr 
                    key={hcp.id} 
                    className={`border-b border-gray-100 ${
                      hcp.isDropped ? 'bg-gray-100 text-gray-500 opacity-80' : 'hover:bg-gray-50'
                    } ${
                      (hcp.id === highlightedRowId) ? 'ring-2 ring-red-500 ring-inset bg-red-50' : ''
                    }`}
                  >
                    <td 
                      onClick={() => onViewHcpDetail(hcp.id)}
                      className="py-2 px-3 font-medium text-green-700 underline cursor-pointer whitespace-nowrap hover:text-green-900"
                    >
                      {hcp.name}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">{hcp.specialty}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{hcp.zip}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{hcp.address}</td>
                    <td className="py-2 px-3 w-28 whitespace-nowrap">
                      {isEditing && !hcp.isDropped ? (
                        <TableDropdown
                          options={['A', 'B', 'C', 'D', 'Others']}
                          value={hcp.segment}
                          onChange={(e) => handleTableChange(hcp.id, 'segment', e.target.value)}
                          disabled={hcp.isDropped}
                        />
                      ) : (
                        <span>{hcp.segment}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">{hcp.plannedCalls}</td>
                    <td className="py-2 px-3 w-32 whitespace-nowrap">
                      {isEditing ? (
                        <TableDropdown 
                          options={[1, 2, 3, 4, 5]} 
                          value={hcp.refinedCalls}
                          onChange={(e) => handleTableChange(hcp.id, 'refinedCalls', Number(e.target.value))}
                        disabled={hcp.isDropped}
                      />
                    ) : (
                      <span className={`font-semibold ${
                        hcp.priority === 'High' && hcp.refinedCalls < hcp.plannedCalls ? 'text-red-600' : ''
                      }`}>
                        {hcp.refinedCalls}
                      </span>
                    )}
                  </td>
                     <td className="py-2 px-3 w-48 whitespace-nowrap">
                      {isEditing ? (
                         <TableDropdown 
                          options={['Select Priority', 'High', 'Medium', 'Low']} 
                          value={hcp.priority || 'Select Priority'}
                          onChange={(e) => handleTableChange(hcp.id, 'priority', e.target.value)}
                          disabled={hcp.isDropped}
                        />
                      ) : (
                        <span>{hcp.priority !== 'Select Priority' ? hcp.priority : ''}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-center">
                      {isEditing ? (
                        <input
                          type="text"
                          value={hcp.comment || ''}
                          onChange={(e) => handleTableChange(hcp.id, 'comment', e.target.value)}
                          className={`w-full px-2 py-1 border border-gray-300 rounded-md text-xs ${hcp.isDropped ? 'bg-gray-100' : ''}`}
                          placeholder="Add comment..."
                          disabled={hcp.isDropped}
                        />
                      ) : (
                        <Tooltip text={hcp.comment}>
                          {hcp.comment ? (
                            <div className="w-3 h-3 rounded-full bg-green-500 cursor-pointer"></div>
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-transparent"></div>
                          )}
                        </Tooltip>
                      )}
                    </td>
                    {isEditing && (
                      <td className="py-2 px-3 whitespace-nowrap text-center">
                        {hcp.isDropped ? (
                          <button onClick={() => handleReAddHCP(hcp.id)} className="text-gray-400 hover:text-green-600" title="Re-add HCP">
                            <PlusCircleIcon className="w-5 h-5" />
                          </button>
                        ) : (
                          <button onClick={() => openDeleteModal(hcp.id)} className="text-gray-400 hover:text-red-600" title="Drop HCP">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>

      {/* --- Render Delete Modal --- */}
      {showDeleteModal && (
        <DeleteConfirmationModal 
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* --- Render Error/Warning Modal --- */}
      {showErrorModal && (
        <ErrorWarningModal 
          onClose={() => setShowErrorModal(false)} 
          errors={kpis.errorsList}
          warnings={kpis.warningsList}
          onHighlightRow={handleHighlightRow}
        />
      )}
      
      {/* --- Render Warning Confirmation Modal --- */}
      {showSubmitWarningModal && (
        <WarningConfirmationModal
          onCancel={() => setShowSubmitWarningModal(false)}
          onConfirm={submitPlan}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};


// --- COMPLETELY REBUILT AddHCPPage ---
const AddHCPPage = ({ onNavigate, onLogout, userName, userRole, hcpData, setHcpData, lastAddedHcpIds, setLastAddedHcpIds, activePage }) => {
  const [selectedHCPs, setSelectedHCPs] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // --- NEW Filter States ---
  const [nameFilter, setNameFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('Select Specialty');
  const [zipFilter, setZipFilter] = useState('');

  // --- NEW Filtered Data Logic ---
  const filteredData = useMemo(() => {
    return mockAddHCPData.filter(hcp => {
      const nameMatch = nameFilter === '' || hcp.name.toLowerCase().includes(nameFilter.toLowerCase());
      const specialtyMatch = specialtyFilter === 'Select Specialty' || hcp.specialty === specialtyFilter;
      const zipMatch = zipFilter === '' || hcp.zip.toLowerCase().includes(zipFilter.toLowerCase()); // zip is City here
      return nameMatch && specialtyMatch && zipMatch;
    });
  }, [nameFilter, specialtyFilter, zipFilter]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredData.slice(start, end);
  }, [currentPage, filteredData]);
  
  const paginatedIds = useMemo(() => paginatedData.map(hcp => hcp.id), [paginatedData]);

  const handleSelect = (id) => {
    setSelectedHCPs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAllOnPage = (e) => {
    if (e.target.checked) {
      setSelectedHCPs(prev => new Set([...prev, ...paginatedIds]));
    } else {
      setSelectedHCPs(prev => {
        const newSet = new Set(prev);
        paginatedIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  };
  
  const isAllOnPageSelected = useMemo(() => {
    if (paginatedIds.length === 0) return false;
    return paginatedIds.every(id => selectedHCPs.has(id));
  }, [paginatedIds, selectedHCPs]);
  
  const handleAddClick = () => {
    if (selectedHCPs.size > 0) {
      setShowConfirmModal(true);
    }
  };

  const handleAddConfirmed = () => {
    // 1. Transform selected data
    const newHcpEntries = mockAddHCPData
      .filter(hcp => selectedHCPs.has(hcp.id))
      .map((hcp, index) => ({
        id: Date.now() + index, // Create a unique ID
        name: hcp.name,
        specialty: hcp.specialty,
        zip: hcp.zip, // In mock data, this is city. Using it as zip.
        address: `${hcp.name}, ${hcp.zip}`, // Mock address
        segment: 'New', // Default segment
        plannedCalls: hcp.recommendedCalls,
        refinedCalls: hcp.recommendedCalls,
        priority: 'Select Priority', // Default priority
        status: 'updated',
        comment: '',
        isDropped: false,
        isNew: true // <-- Mark as new
      }));
      
    // Store the new IDs
    const newIds = newHcpEntries.map(hcp => hcp.id);
    setLastAddedHcpIds(newIds);

    // 2. Update the main data state
    setHcpData(prevData => [...prevData, ...newHcpEntries]);

    // 3. Close confirm modal, show success modal
    setShowConfirmModal(false);
    setShowSuccessModal(true);
    setSelectedHCPs(new Set()); // Clear selection
  };
  
  const handleUndoAdd = () => {
    setHcpData(prevData => prevData.filter(hcp => !lastAddedHcpIds.includes(hcp.id)));
    setLastAddedHcpIds([]);
    setShowSuccessModal(false);
  };

  const handleCloseSuccessModal = () => {
    setLastAddedHcpIds([]); // Clear undo state
    setShowSuccessModal(false);
  };
  
  // --- NEW Clear Filters Function ---
  const clearFilters = () => {
    setNameFilter('');
    setSpecialtyFilter('Select Specialty');
    setZipFilter('');
    setCurrentPage(1);
  };
  
    // --- Add HCP Modals ---
  const ConfirmationModal = ({ count, onCancel, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm text-center">
        <ExclamationCircleIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add HCPs</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to add {count} selected HCP(s) to your plan?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="py-2 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="py-2 px-6 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Yes, Add
          </button>
        </div>
      </div>
    </div>
  );
  
  const SuccessModal = ({ onUndo, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm text-center">
        <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-4">HCPs Added Successfully!</h2>
        <p className="text-gray-600 mb-6">
          The selected HCPs have been added to your dashboard.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onClose}
            className="py-2 px-6 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            OK
          </button>
          <button
            onClick={onUndo}
            className="text-sm text-gray-600 hover:underline"
          >
            Undo
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#d1fae5] to-[#f0fdfa] font-sans relative flex">
      <Sidebar onLogout={onLogout} userRole={userRole} activePage={activePage} onNavigate={onNavigate} />
      
      <main className="flex-1 p-6 overflow-hidden ml-24 flex flex-col">
        {/* --- Header --- */}
        <AppHeader 
          onLogout={onLogout}
          userName={userName}
          userRole={userRole} 
          title="Add new HCP"
          onBack={() => onNavigate('dashboard')}
          onNavigate={onNavigate}
          pageName={activePage} // Pass page name
          // No territory switcher props needed here
        />

        {/* --- Apply Filters Section --- */}
        <div 
          className="bg-white p-3 rounded-xl shadow-sm mb-4 border border-green-200 flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, #F9FEFB 0%, #F3FCF8 100%)',
          }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Apply filters</h2>
          <div className="flex items-end">
            <FilterInput 
              label="Customer Name" 
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search by name..."
            />
            <FilterDropdown 
              label="Specialty" 
              options={['Select Specialty', ...new Set(mockAddHCPData.map(hcp => hcp.specialty))]} 
              className="w-64"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            />
            <FilterDropdown 
              label="Priority" 
              options={['Select Priority']} // No data for this
              className="w-64"
              value="Select Priority"
              onChange={() => {}} // No-op
            />
            <FilterInput 
              label="ZIP" 
              value={zipFilter}
              onChange={(e) => setZipFilter(e.target.value)}
              placeholder="Search by zip/city..."
            />
            <button 
              onClick={clearFilters}
              className="ml-4 py-2 px-4 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* --- Approved Customers Table --- */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Approved Customers</h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleAddClick}
                disabled={selectedHCPs.size === 0}
                className={`py-1.5 px-5 rounded-lg text-xs font-semibold text-white shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5 bg-gradient-to-r from-green-600 to-green-500 ${selectedHCPs.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Add
              </button>
            </div>
          </div>
            
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
            {paginatedData.length === 0 ? (
              <EmptyState title="No HCPs Found" message="Try adjusting your filters to find HCPs in the master list." />
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-green-100 sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-3 w-12">
                      <input 
                        type="checkbox" 
                        className="rounded text-green-600 focus:ring-green-500"
                        onChange={handleSelectAllOnPage}
                        checked={isAllOnPageSelected}
                      />
                    </th>
                    <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap">HCP Name</th>
                    <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap">Specialty</th>
                    <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap">ZIP Code</th>
                    <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap">Recommended Calls</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((hcp) => ( // Use paginatedData
                    <tr key={hcp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <input 
                          type="checkbox" 
                          className="rounded text-green-600 focus:ring-green-500"
                          checked={selectedHCPs.has(hcp.id)}
                          onChange={() => handleSelect(hcp.id)}
                        />
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-800 whitespace-nowrap">{hcp.name}</td>
                      <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{hcp.specialty}</td>
                      <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{hcp.zip}</td>
                      <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{hcp.recommendedCalls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
      
      {/* --- Modals --- */}
      {showConfirmModal && (
        <ConfirmationModal
          count={selectedHCPs.size}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleAddConfirmed}
        />
      )}
      {showSuccessModal && (
        <SuccessModal 
          onUndo={handleUndoAdd}
          onClose={handleCloseSuccessModal}
        />
      )}
      
    </div>
  );
};


// --- NEW HCP Detail Page Component ---
const HCPDetailPage = ({ onNavigate, onLogout, userName, userRole, hcp, activePage }) => {
  
  // Hydrate the simple hcp data with the full mock data
  const staticDetailedMockData = {
    firstName: hcp.name.split(' ')[0],
    lastName: hcp.name.split(' ').slice(1).join(' '),
    npiId: '1234567890',
    mdmId: 'MDM-HCP-001',
    orgId: 'ORG-12345',
    source: 'Epic EMR',
    deaNum: 'DEA-AB1234567',
    organization: 'Metro Health Hospital',
    phone: '+1-617-555-0123',
    email: `${hcp.name.split(' ')[0].toLowerCase()}.${hcp.name.split(' ').slice(1).join('').toLowerCase()}@metrohealth.com`,
    preferredContact: ['Email', 'Phone'],
    address: '123 Medical Plaza, Boston, MA 02115',
    country: 'USA',
    affiliations: ['American College of Cardiology', 'AMA'],
    education: [
      { type: 'MD', school: 'Harvard Medical School', field: 'Medicine', year: '2010' },
      { type: 'Residency', school: 'Johns Hopkins University', field: 'Cardiology', year: '2014' },
    ],
    licenses: 'MA-MD-123456',
    certifications: 'Board Certified - MD',
    created: '01/15/2024, 05:30',
    lastUpdated: '01/15/2024, 05:30',
    // Add other specialties from the screenshot
    specialties: [hcp.specialty, 'Internal Medicine'],
  };

  const detailedHCP = {
    ...hcp,
    ...staticDetailedMockData,
    // Ensure specialties are combined and unique if needed, but for mock-up, static is fine
    specialties: [hcp.specialty, 'Internal Medicine'] 
  };
  
  // Helper components for styling
  const DetailCard = ({ title, icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
      <div className="flex items-center text-lg font-semibold text-gray-800 mb-4">
        {title}
      </div>
      <div className="absolute top-6 right-6 text-green-500">
        {icon}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
  
  const InfoPair = ({ label, value }) => (
    <div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
  
  const Tag = ({ text }) => (
    <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
      {text}
    </span>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#d1fae5] to-[#f0fdfa] font-sans relative flex">
      <Sidebar onLogout={onLogout} userRole={userRole} activePage={activePage} onNavigate={onNavigate} />
      
      <main className="flex-1 p-6 overflow-hidden ml-24 flex flex-col">
        <AppHeader 
          onLogout={onLogout} 
          userName={userName}
          userRole={userRole} 
          title="CPM Dashboard"
          onBack={() => onNavigate('dashboard')}
          onNavigate={onNavigate}
          pageName={activePage} // Pass page name
          // No territory switcher props needed here
        />

        <div className="flex-1 overflow-y-auto pr-2">
          {/* Header Card */}
          <div className="bg-green-600 text-white p-6 rounded-2xl mb-6">
            <h2 className="text-2xl font-bold">Dr. {detailedHCP.name}</h2>
            <div className="flex gap-2 mt-2">
              {detailedHCP.specialties.map(spec => <Tag key={spec} text={spec} />)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content (Left/Center) */}
            <div className="lg:col-span-2 space-y-6">
              <DetailCard title="Primary Information" icon={<UserIcon />}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoPair label="First Name" value={detailedHCP.firstName} />
                  <InfoPair label="Last Name" value={detailedHCP.lastName} />
                  <InfoPair label="NPI ID" value={detailedHCP.npiId} />
                  <InfoPair label="MDM ID" value={detailedHCP.mdmId} />
                  <InfoPair label="Organization ID" value={detailedHCP.orgId} />
                  <InfoPair label="Source" value={detailedHCP.source} />
                </div>
              </DetailCard>
              
              <DetailCard title="Identifiers" icon={<IdentificationIcon className="w-8 h-8" />}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoPair label="NPI" value={detailedHCP.npiId} />
                  <InfoPair label="DEA" value={detailedHCP.deaNum} />
                </div>
              </DetailCard>

              <DetailCard title="Organization" icon={<BuildingOfficeIcon active />}>
                <InfoPair label="Organization" value={detailedHCP.organization} />
              </DetailCard>

              <DetailCard title="Contact Information" icon={<PhoneIconDetail className="w-8 h-8" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoPair label="Phone" value={detailedHCP.phone} />
                  <InfoPair label="Email" value={detailedHCP.email} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">Preferred Contact Methods</div>
                  <div className="flex gap-2">
                    {detailedHCP.preferredContact.map(method => <Tag key={method} text={method} />)}
                  </div>
                </div>
              </DetailCard>
              
              <DetailCard title="Address" icon={<MapPinIcon />}>
                <InfoPair label="Address" value={detailedHCP.address} />
                <InfoPair label="Country" value={detailedHCP.country} />
              </DetailCard>

              <DetailCard title="Professional Information" icon={<IdentificationIcon className="w-8 h-8" />}>
                <InfoPair label="Organization" value={detailedHCP.organization} />
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">Specialties</div>
                  <div className="flex gap-2 flex-wrap">
                    {detailedHCP.specialties.map(spec => <Tag key={spec} text={spec} />)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">Affiliations</div>
                  <div className="flex gap-2 flex-wrap">
                    {detailedHCP.affiliations.map(aff => <Tag key={aff} text={aff} />)}
                  </div>
                </div>
              </DetailCard>
              
              <DetailCard title="Education" icon={<AcademicCapIcon />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailedHCP.education.map(edu => (
                    <div key={edu.type} className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-semibold text-sm text-gray-800">{edu.type}</div>
                      <div className="text-sm text-gray-600">{edu.school}</div>
                      <div className="text-xs text-gray-500">{edu.field} - {edu.year}</div>
                    </div>
                  ))}
                </div>
              </DetailCard>
            </div>
            
            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <DetailCard title="Licenses & Certifications" icon={<IdentificationIcon className="w-8 h-8" />}>
                <InfoPair label="Active Licenses" value={detailedHCP.licenses} />
                <InfoPair label="Certifications" value={detailedHCP.certifications} />
              </DetailCard>

              <DetailCard title="Record Information" icon={<ClipboardDocumentIcon />}>
                <InfoPair label="Created" value={detailedHCP.created} />
                <InfoPair label="Last Updated" value={detailedHCP.lastUpdated} />
              </DetailCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};


// --- NEW Notification Page Component ---
const NotificationPage = ({ onNavigate, onLogout, userName, userRole, activePage }) => {
  // A larger mock list for the full page
  const allNotifications = [
    { id: 1, type: 'success', message: 'Your plan has been successfully submitted to DMartin.', time: '1 day ago' },
    { id: 2, type: 'hq', message: 'Plan approved by HQ. You may begin execution.', time: '2 days ago' },
    { id: 3, type: 'error', message: 'Error: Missing call frequency for Dr. Elise Bennet.', time: '2 days ago' },
    { id: 4, type: 'warning', message: 'Warning: You planned fewer calls than recommended for Tier 1 HCPs.', time: '2 days ago' },
    { id: 5, type: 'rep', message: 'Your territory rep Sarah (Rep001) has submitted a call plan for review.', time: '3 days ago' },
    { id: 6, type: 'dm', message: 'Plan approved and forwarded to Regional Manager.', time: '4 days ago' },
    { id: 7, type: 'rm', message: 'RManager has approved a plan. It is ready for final review.', time: '5 days ago' },
    { id: 8, type: 'system', message: 'System update scheduled for 10:00 PM tonight.', time: '1 week ago' },
    { id: 9, type: 'success', message: 'Your profile information was successfully updated.', time: '2 weeks ago' },
  ];

  // Filter by role for demonstration, or show all
  const relevantNotifications = allNotifications; // Showing all for a "View All" page

  const getIconForType = (type) => {
    switch(type) {
      case 'success':
      case 'hq':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon className="w-5 h-5" />;
      case 'rep':
      case 'dm':
      case 'rm':
        return <UserCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <BellIcon />;
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#d1fae5] to-[#f0fdfa] font-sans relative flex">
      <Sidebar onLogout={onLogout} userRole={userRole} activePage={activePage} onNavigate={onNavigate} />
      
      <main className="flex-1 p-6 overflow-hidden ml-24 flex flex-col">
        <AppHeader 
          onLogout={onLogout} 
          userName={userName}
          userRole={userRole} 
          title="All Notifications"
          onBack={() => onNavigate(userRole === 'rep' ? 'dashboard' : 'approvalRequests')}
          onNavigate={onNavigate}
          pageName={activePage} // Pass page name
          // No territory switcher props needed here
        />

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent</h2>
            <ul className="space-y-4">
              {relevantNotifications.map(notif => (
                <li key={notif.id} className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 border-b last:border-b-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {getIconForType(notif.type)}
                  </div>
                  <div>
                    <p className={`text-sm ${
                      notif.type === 'error' ? 'text-red-700' :
                      notif.type === 'warning' ? 'text-yellow-700' :
                      'text-gray-800'
                    }`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- UPDATED APPROVAL REQUESTS PAGE ---
const ApprovalRequestsPage = ({ 
  onNavigate, 
  onLogout, 
  userName,
  userRole, 
  activePage, 
  managedRegions, // NEW: List of regions DM manages, e.g., ['Illinois']
  onDrillDown // NEW: Function to drill down to a rep's dashboard
}) => {
  const [expandedRegions, setExpandedRegions] = useState(new Set(managedRegions)); // Default open managed regions
  const [approvalData, setApprovalData] = useState(mockApprovalRequestsData);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState(null); // { regionId, territoryId }

  // --- NEW: Filter data based on managed regions ---
  const filteredApprovalData = useMemo(() => {
    if (userRole === 'dm') {
      return approvalData.filter(region => managedRegions.includes(region.name));
    }
    return approvalData; // Reps shouldn't see this page, but as a fallback
  }, [approvalData, managedRegions, userRole]);

  const toggleRegion = (regionId) => {
    setExpandedRegions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(regionId)) {
        newSet.delete(regionId);
      } else {
        newSet.add(regionId);
      }
      return newSet;
    });
  };

  const getApprovalIcon = (status) => {
    switch (status) {
      case 'APPROVED': // Changed to uppercase for consistency
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'REJECTED': // This state won't really persist, but good to have
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default: // 'PENDING'
        return <MinusCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };
  
  // --- NEW LOGIC HELPERS ---
  
  /**
   * Determines the active queue for a territory based on its levels.
   */
  const getActiveQueue = (levels) => {
    if (levels.territory === 'PENDING') return 'PENDING_REP'; // Not submitted yet
    if (levels.district === 'PENDING') return 'PENDING_DM';
    if (levels.regional === 'PENDING') return 'PENDING_RM';
    if (levels.hq === 'PENDING') return 'PENDING_HQ';
    return 'APPROVED'; // Fully approved
  };

  /**
   * Checks if the current user can act on a specific queue.
   */
  const canUserAct = (queue, role) => {
    if (role === 'dm' && queue === 'PENDING_DM') return true;
    if (role === 'rm' && queue === 'PENDING_RM') return true;
    if (role === 'hq' && queue === 'PENDING_HQ') return true;
    return false;
  };
  
  /**
   * Gets the key for the user's approval level.
   */
  const getUserLevelKey = (role) => {
    switch (role) {
      case 'dm': return 'district';
      case 'rm': return 'regional';
      case 'hq': return 'hq';
      default: return 'territory';
    }
  };

  // --- NEW EVENT HANDLERS ---
  
  const handleApprove = (regionId, territoryId) => {
    setApprovalData(prevData => {
      return prevData.map(region => {
        if (region.id !== regionId) return region;
        
        return {
          ...region,
          territories: region.territories.map(ter => {
            if (ter.id !== territoryId) return ter;
            
            const queue = getActiveQueue(ter.levels);
            const newLevels = { ...ter.levels };

            if (queue === 'PENDING_DM') newLevels.district = 'APPROVED';
            if (queue === 'PENDING_RM') newLevels.regional = 'APPROVED';
            if (queue === 'PENDING_HQ') newLevels.hq = 'APPROVED';
            
            return { ...ter, levels: newLevels };
          })
        };
      });
    });
  };
  
  const handleOpenRejectModal = (regionId, territoryId) => {
    setRejectionTarget({ regionId, territoryId });
    setShowRejectionModal(true);
  };

  const handleConfirmReject = (comment) => {
    if (!rejectionTarget) return;
    const { regionId, territoryId } = rejectionTarget;

    console.log(`Rejecting plan ${territoryId} in region ${regionId}. Comment: ${comment}`);
    
    setApprovalData(prevData => {
      return prevData.map(region => {
        if (region.id !== regionId) return region;
        
        return {
          ...region,
          territories: region.territories.map(ter => {
            if (ter.id !== territoryId) return ter;
            
            // Reset all levels to PENDING (back to rep)
            const newLevels = {
              territory: 'PENDING',
              district: 'PENDING',
              regional: 'PENDING',
              hq: 'PENDING',
            };
            
            return { ...ter, levels: newLevels };
          })
        };
      });
    });
    
    setShowRejectionModal(false);
    setRejectionTarget(null);
  };
  
  const handleBulkApprove = (regionId) => {
    setApprovalData(prevData => {
      return prevData.map(region => {
        if (region.id !== regionId) return region;
        
        const updatedTerritories = region.territories.map(ter => {
          const queue = getActiveQueue(ter.levels);
          // Check if this territory is in the current user's queue
          if (canUserAct(queue, userRole)) {
            const newLevels = { ...ter.levels };
            if (queue === 'PENDING_DM') newLevels.district = 'APPROVED';
            if (queue === 'PENDING_RM') newLevels.regional = 'APPROVED';
            if (queue === 'PENDING_HQ') newLevels.hq = 'APPROVED';
            return { ...ter, levels: newLevels };
          }
          return ter;
        });
        
        return { ...region, territories: updatedTerritories };
      });
    });
  };
  

  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#d1fae5] to-[#f0fdfa] font-sans relative flex">
      <Sidebar onLogout={onLogout} userRole={userRole} activePage={activePage} onNavigate={onNavigate} />
      
      <main className="flex-1 p-6 overflow-hidden ml-24 flex flex-col">
        <AppHeader 
          onLogout={onLogout} 
          userName={userName}
          userRole={userRole} 
          title="Approval Requests"
          onNavigate={onNavigate}
          pageName={activePage} // Pass page name
          // No territory switcher props needed here
        />

        {/* --- Table --- */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
          <table className="w-full min-w-[1200px] text-left text-xs">
            {/* Sticky Header */}
            <thead className="bg-green-100 sticky top-0 z-10">
              {/* Row 1: Main Headers */}
              <tr>
                <th rowSpan={2} className="py-2 px-4 font-semibold text-green-900 w-1/4 align-bottom border-b-2 border-green-200">Territories</th>
                <th rowSpan={2} className="py-2 px-3 font-semibold text-green-900 text-center align-bottom border-b-2 border-green-200">
                  <ErrorIcon />
                </th>
                <th rowSpan={2} className="py-2 px-3 font-semibold text-green-900 text-center align-bottom border-b-2 border-green-200">
                  <WarningIcon />
                </th>
                <th colSpan={4} className="py-2 px-3 font-semibold text-green-900 text-center border-b-2 border-green-200">
                  Submissions
                </th>
                <th rowSpan={2} className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap align-bottom border-b-2 border-green-200">Last accessed by</th>
                <th rowSpan={2} className="py-2 px-3 font-semibold text-green-900 align-bottom border-b-2 border-green-200">Action</th>
              </tr>
              {/* Row 2: Sub-Headers */}
              <tr>
                <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap text-center">Territory level</th>
                <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap text-center">District level</th>
                <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap text-center">Regional level</th>
                <th className="py-2 px-3 font-semibold text-green-900 whitespace-nowrap text-center">HQ level</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {filteredApprovalData.map(region => {
                // --- DYNAMIC PARENT ROW STATS ---
                const userLevelKey = getUserLevelKey(userRole);
                const completedCount = region.territories.filter(
                  t => t.levels[userLevelKey] === 'APPROVED'
                ).length;
                
                return (
                  <React.Fragment key={region.id}>
                    {/* Region (Parent Row) */}
                    <tr className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-800">
                      <td className="py-3 px-4">
                        <button onClick={() => toggleRegion(region.id)} className="flex items-center gap-2">
                          <ChevronRightIcon className={`w-4 h-4 transition-transform ${expandedRegions.has(region.id) ? 'rotate-90' : ''}`} />
                          {region.name}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">-</td>
                      <td className="py-3 px-3 text-center">-</td>
                      {/* Dynamic Stats */}
                      <td className="py-3 px-3 text-center">
                        {userRole === 'rep' ? `${completedCount}/${region.territoryCount}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {userRole === 'dm' ? `${completedCount}/${region.territoryCount}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {userRole === 'rm' ? `${completedCount}/${region.territoryCount}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {userRole === 'hq' ? `${completedCount}/${region.territoryCount}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">-</td>
                      <td className="py-3 px-3">
                        <button 
                          onClick={() => handleBulkApprove(region.id)}
                          className="py-1 px-3 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700"
                        >
                          Bulk Approve
                        </button>
                      </td>
                    </tr>

                    {/* Territories (Child Rows) */}
                    {expandedRegions.has(region.id) && region.territories.map(ter => {
                      const queue = getActiveQueue(ter.levels);
                      const canAct = canUserAct(queue, userRole);
                      
                      return (
                        <tr key={ter.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td 
                            onClick={() => onDrillDown(ter.name)}
                            className="py-2.5 px-4 pl-10 text-green-700 font-medium underline cursor-pointer hover:text-green-900"
                          >
                            {ter.name}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`font-semibold ${ter.errors > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                              {ter.errors}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`font-semibold ${ter.warnings > 0 ? 'text-yellow-600' : 'text-gray-700'}`}>
                              {ter.warnings}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">{getApprovalIcon(ter.levels.territory)}</td>
                          <td className="py-2.5 px-3 text-center">{getApprovalIcon(ter.levels.district)}</td>
                          <td className="py-2.5 px-3 text-center">{getApprovalIcon(ter.levels.regional)}</td>
                          <td className="py-2.5 px-3 text-center">{getApprovalIcon(ter.levels.hq)}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-gray-700">{ter.lastAccessedBy}</div>
                            <div className="text-gray-500">{ter.timestamp}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex gap-2">
                              {/* Updated Buttons with logic */}
                              <button 
                                onClick={() => handleOpenRejectModal(region.id, ter.id)}
                                disabled={!canAct}
                                className="flex items-center gap-1 py-1 px-3 bg-white text-red-600 border border-red-300 text-xs font-semibold rounded-md hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <XIcon className="w-3 h-3" />
                                Reject
                              </button>
                              <button 
                                onClick={() => handleApprove(region.id, ter.id)}
                                disabled={!canAct}
                                className="flex items-center gap-1 py-1 px-3 bg-white text-green-700 border border-green-300 text-xs font-semibold rounded-md hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <CheckIcon className="w-3 h-3" />
                                Approve
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
      
      {/* --- NEW REJECTION MODAL RENDER --- */}
      {showRejectionModal && (
        <RejectionModal 
          onCancel={() => {
            setShowRejectionModal(false);
            setRejectionTarget(null);
          }}
          onConfirm={handleConfirmReject}
        />
      )}
    </div>
  );
};
// --- END UPDATED APPROVAL REQUESTS PAGE ---


// --- Top-Level App Component ---

// --- NEW MOCK DATA FOR ROLES ---
const USER_DATA = {
  rep: {
    name: 'Sarah',
    territories: ['Chicago'], // Rep only has one
    managedRegions: []
  },
  yash: {
    name: 'Yash',
    territories: ['Chicago'], // Rep only has one
    managedRegions: []
  },
  dm: {
    name: 'Mark',
    // DM can *view* all their territories
    territories: ['Chicago', 'Seattle', 'San Francisco', 'New York', 'Austin', 'Springfield'],
    // DM *manages* regions for the approval queue
    managedRegions: ['Illinois'] 
  },
  rm: {
    name: 'Rachel',
    // RM can view all territories in their managed regions
    territories: ['Chicago', 'Seattle', 'San Francisco', 'New York', 'Austin', 'Springfield', 'Boston', 'Portland'],
    // RM manages both regions
    managedRegions: ['Illinois', 'New England']
  }
};


export default function App() {
  const [page, setPage] = useState('login'); // 'login', 'dashboard', 'addHCP', 'hcpDetail', 'notifications', 'approvalRequests'
  const [userRole, setUserRole] = useState(null); // 'rep', 'dm'
  const [userName, setUserName] = useState(''); // 'Sarah', 'Mark'
  
  // --- NEW State Management for Territories ---
  // The list of territories a user *can* view (for the dropdown)
  const [viewableTerritories, setViewableTerritories] = useState([]);
  // The list of regions a DM *manages* (for filtering the approval queue)
  const [managedRegions, setManagedRegions] = useState([]);
  // The *currently active* territory being viewed in the dashboard
  const [activeTerritory, setActiveTerritory] = useState(null);
  
  const [hcpData, setHcpData] = useState(mockHCPData); // Lifted state
  const [lastAddedHcpIds, setLastAddedHcpIds] = useState([]); // Lifted state for Undo
  const [selectedHcpId, setSelectedHcpId] = useState(null); // NEW: For detail page

  const handleLogin = (role, name) => {
    let userData;
    if (role === 'rep') {
      // Special case for 'yash' login
      userData = (name.toLowerCase() === 'yash') ? USER_DATA.yash : USER_DATA.rep;
    } else if (role === 'dm') {
      userData = USER_DATA.dm;
    } else if (role === 'rm') {
      userData = USER_DATA.rm;
    }

    if (!userData) {
      console.error("No user data found for login.");
      return;
    }
    
    setUserRole(role);
    setUserName(name);
    
    if (role === 'rep') {
      setViewableTerritories(userData.territories);
      setManagedRegions(userData.managedRegions);
      setActiveTerritory(userData.territories[0]); // Default to first territory
      setPage('dashboard'); // Reps start on dashboard
    } else if (role === 'dm' || role === 'rm') {
      setViewableTerritories(userData.territories);
      setManagedRegions(userData.managedRegions);
      setActiveTerritory(userData.territories[0]); // Default to first territory
      setPage('approvalRequests'); // DMs/RMs start on approvals
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName('');
    setPage('login');
    setActiveTerritory(null);
    setViewableTerritories([]);
    setManagedRegions([]);
  };

  const handleNavigate = (targetPage) => {
    if (targetPage !== 'hcpDetail') {
      setSelectedHcpId(null);
    }
    setPage(targetPage);
  };
  
  // --- NEW: Handler for DM Drill-Down ---
  const handleDrillDown = (territoryName) => {
    // Check if DM can even view this territory
    if (viewableTerritories.includes(territoryName)) {
      setActiveTerritory(territoryName);
      setPage('dashboard');
    } else {
      console.error(`DM does not have access to territory: ${territoryName}`);
    }
  };

  // NEW: Handler to set selected HCP and change page
  const handleViewHcpDetail = (id) => {
    setSelectedHcpId(id);
    setPage('hcpDetail');
  };

  // --- Page Rendering Logic ---
  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      // --- NO LONGER USED ---
      // case 'territorySelection':
      //   return <TerritorySelectionPage 
      //             onSelectTerritory={handleSelectTerritory} 
      //             onNavigate={handleNavigate}
      //             userRole={userRole} 
      //           />;
      case 'dashboard':
        return <TerritoryDashboardPage 
                  onNavigate={handleNavigate} 
                  onLogout={handleLogout}
                  userName={userName}
                  userRole={userRole}
                  activeTerritory={activeTerritory} // Pass current territory
                  territories={viewableTerritories} // Pass all viewable territories
                  onSetTerritory={setActiveTerritory} // Pass setter
                  hcpData={hcpData} // Pass state down
                  setHcpData={setHcpData} // Pass setter down
                  onViewHcpDetail={handleViewHcpDetail} // Pass new handler
                  activePage={page} // Pass active page
                />;
      case 'addHCP':
        // Now renders the new page
        return <AddHCPPage 
                  onNavigate={handleNavigate} 
                  onLogout={handleLogout} 
                  userName={userName}
                  userRole={userRole}
                  hcpData={hcpData} // Pass full data
                  setHcpData={setHcpData} // Pass setter down
                  lastAddedHcpIds={lastAddedHcpIds} // Pass undo state
                  setLastAddedHcpIds={setLastAddedHcpIds} // Pass undo setter
                  activePage={page} // Pass active page
                />;
      // --- REMOVED OLD 'approval' PAGE ---
      // --- NEW PAGE CASE ---
      case 'approvalRequests':
        return <ApprovalRequestsPage
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                  userName={userName}
                  userRole={userRole}
                  activePage={page}
                  managedRegions={managedRegions} // Pass DM's regions
                  onDrillDown={handleDrillDown} // Pass drill-down function
                />;
      case 'hcpDetail': {
        const selectedHcp = hcpData.find(hcp => hcp.id === selectedHcpId);
        // Failsafe: if no HCP is selected, go back to dashboard
        if (!selectedHcp) {
          setPage('dashboard'); // Force navigation back
          return null; // Render nothing this cycle, will re-render on dashboard
        }
        return <HCPDetailPage 
                  onNavigate={handleNavigate} 
                  onLogout={handleLogout}
                  userName={userName}
                  userRole={userRole}
                  hcp={selectedHcp} 
                  activePage={page} // Pass active page
                />;
      }
      case 'notifications': // NEW PAGE
        return <NotificationPage
                  onNavigate={handleNavigate} 
                  onLogout={handleLogout}
                  userName={userName}
                  userRole={userRole}
                  activePage={page} // Pass active page
                />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="antialiased">
      {renderPage()}
    </div>
  );
}