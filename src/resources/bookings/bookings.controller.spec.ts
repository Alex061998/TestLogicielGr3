import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Room } from '../rooms/entities/room.entity';
import { User } from '../users/entities/user.entity';

describe('BookingsService', () => {
    let bookingsService: BookingsService;
    let bookingRepository: Repository<Booking>;
    let roomRepository: Repository<Room>;
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingsService,
                {
                    provide: 'BookingRepository',
                    useClass: Repository,
                },
                {
                    provide: 'RoomRepository',
                    useClass: Repository,
                },
                {
                    provide: 'UserRepository',
                    useClass: Repository,
                },
            ],
        }).compile();

        bookingsService = module.get<BookingsService>(BookingsService);
        bookingRepository = module.get<Repository<Booking>>('BookingRepository');
        roomRepository = module.get<Repository<Room>>('RoomRepository');
        userRepository = module.get<Repository<User>>('UserRepository');
    });

    describe('create', () => {
        it( 'should create a booking when the constraints are met', async () => {
            const createBookingDto = {
                startTime: '2023-07-01T10:00:00',
                endTime: '2023-07-01T12:00:00',
                description: 'Booking description',
                title: 'Booking title',
                room: 'room-id',
            };
            const userId = 'user-id';

            const booking = new Booking();
            booking.startTime = new Date(createBookingDto.startTime);
            booking.endTime = new Date(createBookingDto.endTime);
            booking.description = createBookingDto.description;
            booking.title = createBookingDto.title;
            booking.room = new Room();
            booking.user = new User();

            jest.spyOn(roomRepository, 'findOneOrFail').mockResolvedValue(booking.room);
            jest.spyOn(userRepository, 'find').mockResolvedValue([booking.user]);
            jest.spyOn(bookingRepository, 'save').mockResolvedValue(booking);

            await bookingsService.create(createBookingDto, userId);

            expect(roomRepository.findOneOrFail).toHaveBeenCalledWith({id: createBookingDto.room});
            expect(userRepository.find).toHaveBeenCalledWith({id: userId});
            expect(bookingRepository.save).toHaveBeenCalledWith(booking);
        });

        it('should throw an error when user has already booked', async () => {
            const createBookingDto = {
                startTime: '2023-07-01T10:00:00',
                endTime: '2023-07-01T12:00:00',
                description: 'Booking description',
                title: 'Booking title',
                room: 'room-id',
            };
            const userId = 'user-id';

            jest.spyOn(roomRepository, 'findOneOrFail').mockResolvedValue(new Room());
            jest.spyOn(userRepository, 'find').mockResolvedValue([]);

            await expect(bookingsService.create(createBookingDto, userId)).rejects.toThrowError();
        });
    });

    describe('create', () => {
        it('should create a booking for a user', async () => {
            const createBookingDto = {
                startTime: '2023-07-01T10:00:00',
                endTime: '2023-07-01T12:00:00',
                description: 'Booking description',
                title: 'Booking title',
                room: 'room-id',
            };
            const userId = 'user-id';

            const booking = new Booking();
            booking.startTime = new Date(createBookingDto.startTime);
            booking.endTime = new Date(createBookingDto.endTime);
            booking.description = createBookingDto.description;
            booking.title = createBookingDto.title;
            booking.room = new Room();
            booking.user = new User();

            jest.spyOn(roomRepository, 'findOneOrFail').mockResolvedValue(booking.room);
            jest.spyOn(userRepository, 'find').mockResolvedValue([booking.user]);
            jest.spyOn(bookingRepository, 'save').mockResolvedValue(booking);

            await bookingsService.create(createBookingDto, userId);

            expect(roomRepository.findOneOrFail).toHaveBeenCalledWith({ id: createBookingDto.room });
            expect(userRepository.find).toHaveBeenCalledWith({ id: userId });
            expect(bookingRepository.save).toHaveBeenCalledWith(booking);
        });

        it('should throw an error if the user has already booked a room', async () => {
            const createBookingDto = {
                startTime: '2023-07-01T10:00:00',
                endTime: '2023-07-01T12:00:00',
                description: 'Booking description',
                title: 'Booking title',
                room: 'room-id',
            };
            const userId = 'user-id';

            const booking = new Booking();
            booking.room = new Room();
            booking.user = new User();

            jest.spyOn(roomRepository, 'findOneOrFail').mockResolvedValue(booking.room);
            jest.spyOn(userRepository, 'find').mockResolvedValue([booking.user]);

            await expect(bookingsService.create(createBookingDto, userId)).rejects.toThrowError();
        });

        it('should throw an error if the room is already booked', async () => {
            const createBookingDto = {
                startTime: '2023-07-01T10:00:00',
                endTime: '2023-07-01T12:00:00',
                description: 'Booking description',
                title: 'Booking title',
                room: 'room-id',
            };
            const userId = 'user-id';

            const booking = new Booking();
            booking.room = new Room();
            booking.user = new User();

            jest.spyOn(roomRepository, 'findOneOrFail').mockResolvedValue(booking.room);
            jest.spyOn(userRepository, 'find').mockResolvedValue([]); // No existing bookings for the user
            jest.spyOn(bookingRepository, 'find').mockResolvedValue([booking]); // Room is already booked

            await expect(bookingsService.create(createBookingDto, userId)).rejects.toThrowError();
        });
    });
})
