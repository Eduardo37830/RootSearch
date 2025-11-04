import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CourseOwnershipGuard } from './guards/course-ownership.guard';
import { CourseEnrollmentGuard } from './guards/course-enrollment.guard';
import { Course, CourseSchema } from './schemas/course.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Role, RoleSchema } from '../auth/schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CourseOwnershipGuard, CourseEnrollmentGuard],
  exports: [CoursesService, CourseOwnershipGuard, CourseEnrollmentGuard],
})
export class CoursesModule {}
