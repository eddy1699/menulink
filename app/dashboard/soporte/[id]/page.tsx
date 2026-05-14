import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { TicketDetailClient } from './TicketDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TicketDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id,
      restaurant: { owner: { email: session.user.email ?? undefined } },
    },
    include: {
      restaurant: { select: { name: true } },
      messages: {
        include: { attachments: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!ticket) notFound()

  return (
    <TicketDetailClient
      ticket={{
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt.toISOString(),
        resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
        messages: ticket.messages.map((m) => ({
          id: m.id,
          senderType: m.senderType,
          senderName: m.senderName,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
          attachments: m.attachments.map((a) => ({
            fileUrl: a.fileUrl,
            fileName: a.fileName,
            fileSize: a.fileSize,
            mimeType: a.mimeType,
          })),
        })),
      }}
    />
  )
}
