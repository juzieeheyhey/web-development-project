import { Request, Response } from 'express';
import prisma from '../prisma_client.ts';

export const get_events_for_user = async (req: Request, res: Response) => {
  const userId = req.body.user.id;
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          {
            createdById: userId,
          },
        ],
      },
      // for showing tags and location
      include: {
        tags: true,
        location: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });
    return res.json(events);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const get_active_events = async (_: Request, res: Response) => {
  try {
    const now = new Date();
    const activeEvents = await prisma.event.findMany({
      where: {
        AND: [
          {
            exp_time: {
              gt: now,
            },
          },
          {
            done: false,
          },
        ],
      },
      include: {
        tags: true,
        location: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        photos: {
          take: 1, // Take only the first photo
          select: {
            photo: true,
          },
        },
      },
    });
    return res.json({ events: activeEvents });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const get_event_by_id = async (req: Request, res: Response) => {
  // Fields expected from the client in the GET request:
  // - event_id: number
  const { event_id } = req.params;

  // Check if event_id exists and is a valid number
  if (!event_id || isNaN(Number(event_id))) {
    return res.status(400).json({ error: 'Invalid event_id' });
  }
  try {
    const event = await prisma.event.findUnique({
      where: { event_id: Number(event_id) },
      include: {
        tags: true,
        location: true,
        photos: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });
    if (event === null) {
      return res.status(404).json({ error: 'Event ID not found' });
    }
    return res.json(event);
  } catch (error) {
    console.error('Error retrieving event description:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const create_event = async (req: Request, res: Response) => {
  console.log('CREATE_EVENT SERVER STARTED');
  console.log('Received request body:', req.body);

  const { exp_time, description, qty, tags, location, photos } = req.body;

  try {
    const userId = req.body.user.id;
    const now = new Date().toISOString();

    if (exp_time && new Date(exp_time) <= new Date(now)) {
      throw new Error('Expiration time must be after the current time.');
    }

    if (!description || description.trim() === '') {
      throw new Error('Description cannot be empty.');
    }

    if (!qty || qty.trim() === '') {
      throw new Error('Quantity cannot be empty.');
    }

    if (photos.length > 10) {
      throw new Error('Upload no more than 10 photos.');
    }

    if (!exp_time || exp_time.trim() === '') {
      throw new Error('Expiration time must exist.');
    }

    if (!location.Address || location.Address.trim() === '') {
      throw new Error('Location address cannot be empty.');
    }

    if (!location.floor || location.floor === '') {
      throw new Error('Location floor cannot be empty.');
    }

    if (isNaN(location.floor)) {
      throw new Error('Location floor must be an integer.');
    }

    if (!location.room || location.room.trim() === '') {
      throw new Error('Location room cannot be empty.');
    }

    // Convert photo data to base64 if it exists
    // const photoBase64 = photos ? Buffer.from(photos, 'base64').toString('base64') : '';

    console.log('Value of tags:', tags);

    // Use optional chaining to handle optional elements
    const newEvent = await prisma.event.create({
      data: {
        post_time: now,
        exp_time,
        description,
        qty,
        done: false,
        tags: {
          connect: tags.map((tagId) => ({ tag_id: tagId }) as { tag_id: number }),
        },
        createdBy: {
          connect: { id: userId },
        },
        createdAt: now,
        updatedAt: now,
        location: {
          create: {
            Address: location.Address || '',
            floor: location.floor || 0,
            room: location.room || '',
            loc_note: location?.loc_note || '',
          },
        },
        photos: {
          create: photos.map((photo: string) => ({
            photo: photo || '',
          })),
        },
      },
    });

    res.status(201).json(newEvent);
    // Add a return statement here to fix the TypeScript error
    return;
  } catch (error) {
    console.error('Error creating event:', error);
    console.log('Received request body:', req.body);

    res.status(500).json(`Server error: ${error.message}`);
  }
};


export const edit_event = async (req: Request, res: Response) => {
  const { event_id } = req.params;
  const { exp_time, description, qty, location, photo, tag_ids } = req.body;

  try {
    const updatedEvent = await prisma.event.update({
      where: {
        event_id: Number(event_id),
      },
      data: {
        exp_time,
        description,
        qty,
        location: {
          update: {
            Address: location.Address,
            floor: location.floor,
            room: location.room,
            loc_note: location.loc_note,
          },
        },
        tags: {
          set: tag_ids.map((tag_id: number) => ({ tag_id })),
        },
      },
      include: {
        tags: true,
        location: true,
        photos: true,
      },
    });

    if (photo) {
      const newPhoto = await prisma.photo.create({
        data: {
          photo: photo,
          event: { connect: { event_id: updatedEvent.event_id } },
        },
      });
      updatedEvent.photos.push(newPhoto);
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
