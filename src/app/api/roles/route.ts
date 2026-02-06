import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Default roles with permissions
const defaultRoles = [
  {
    id: 'role-owner',
    name: 'owner',
    permissions: {
      leads: { view: true, create: true, edit: true, delete: true },
      enquiries: { view: true, create: true, edit: true, delete: true },
      survey: { view: true, create: true, edit: true, delete: true },
      quotation: { view: true, create: true, edit: true, delete: true },
      registration: { view: true, create: true, edit: true, delete: true },
      payments: { view: true, create: true, edit: true, delete: true },
      bom: { view: true, create: true, edit: true, delete: true },
      dispatch: { view: true, create: true, edit: true, delete: true },
      installation: { view: true, create: true, edit: true, delete: true },
      liaison: { view: true, create: true, edit: true, delete: true },
      wcr: { view: true, create: true, edit: true, delete: true },
      subsidy: { view: true, create: true, edit: true, delete: true },
      users: { view: true, create: true, edit: true, delete: true },
    },
    userCount: 1,
  },
  {
    id: 'role-admin',
    name: 'admin',
    permissions: {
      leads: { view: true, create: true, edit: true, delete: true },
      enquiries: { view: true, create: true, edit: true, delete: true },
      survey: { view: true, create: true, edit: true, delete: true },
      quotation: { view: true, create: true, edit: true, delete: true },
      registration: { view: true, create: true, edit: true, delete: true },
      payments: { view: true, create: true, edit: true, delete: true },
      bom: { view: true, create: true, edit: true, delete: true },
      dispatch: { view: true, create: true, edit: true, delete: true },
      installation: { view: true, create: true, edit: true, delete: true },
      liaison: { view: true, create: true, edit: true, delete: true },
      wcr: { view: true, create: true, edit: true, delete: true },
      subsidy: { view: true, create: true, edit: true, delete: true },
      users: { view: true, create: true, edit: true, delete: false },
    },
    userCount: 0,
  },
  {
    id: 'role-editor',
    name: 'editor',
    permissions: {
      leads: { view: true, create: true, edit: true, delete: false },
      enquiries: { view: true, create: true, edit: true, delete: false },
      survey: { view: true, create: true, edit: true, delete: false },
      quotation: { view: true, create: true, edit: true, delete: false },
      registration: { view: true, create: true, edit: false, delete: false },
      payments: { view: true, create: false, edit: false, delete: false },
      bom: { view: true, create: true, edit: true, delete: false },
      dispatch: { view: true, create: true, edit: true, delete: false },
      installation: { view: true, create: true, edit: true, delete: false },
      liaison: { view: true, create: true, edit: true, delete: false },
      wcr: { view: true, create: true, edit: true, delete: false },
      subsidy: { view: true, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
    },
    userCount: 0,
  },
  {
    id: 'role-viewer',
    name: 'viewer',
    permissions: {
      leads: { view: true, create: false, edit: false, delete: false },
      enquiries: { view: true, create: false, edit: false, delete: false },
      survey: { view: true, create: false, edit: false, delete: false },
      quotation: { view: true, create: false, edit: false, delete: false },
      registration: { view: true, create: false, edit: false, delete: false },
      payments: { view: true, create: false, edit: false, delete: false },
      bom: { view: true, create: false, edit: false, delete: false },
      dispatch: { view: true, create: false, edit: false, delete: false },
      installation: { view: true, create: false, edit: false, delete: false },
      liaison: { view: true, create: false, edit: false, delete: false },
      wcr: { view: true, create: false, edit: false, delete: false },
      subsidy: { view: true, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
    },
    userCount: 0,
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return default roles for now
    return NextResponse.json({ roles: defaultRoles });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}
