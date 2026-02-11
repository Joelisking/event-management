import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FieldLabel, FieldError } from '@/components/ui/field';
import { DateTimeRangePicker } from '@/components/ui/date-time-range-picker';
import { ImageUpload } from '@/components/ui/image-upload';

const eventSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  description: yup.string(),
  startDate: yup.string().required('Start date is required'),
  endDate: yup
    .string()
    .nullable()
    .test(
      'is-after-start',
      'End date/time must be after start date/time',
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return new Date(value) > new Date(startDate);
      }
    ),
  capacity: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === '' ? null : value
    )
    .positive('Capacity must be a positive number')
    .integer('Capacity must be a whole number'),
  location: yup
    .string()
    .max(500, 'Location must be less than 500 characters'),
  category: yup
    .string()
    .max(100, 'Category must be less than 100 characters'),
  points: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' ? 0 : value
    )
    .min(0, 'Points cannot be negative')
    .integer('Points must be a whole number')
    .default(10),
  imageUrl: yup
    .string()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === '' ? null : originalValue
    )
    .url('Must be a valid URL')
    .notRequired(),
});

export function EventForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = 'Save',
  cancelHref = '/admin/dashboard',
}) {
  const [useTimeSlots, setUseTimeSlots] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      capacity: '',
      location: '',
      category: '',
      points: 10,
      imageUrl: '',
    },
  });

  const imageUrl = watch('imageUrl');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Handle multi-day logic
  const isMultiDay =
    startDate &&
    endDate &&
    (() => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startDay = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );
      const endDay = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      );
      return endDay > startDay;
    })();

  // time slots
  useEffect(() => {
    if (useTimeSlots && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Check if event spans multiple days
      const startDay = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );
      const endDay = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      );
      const daysDiff = Math.ceil(
        (endDay - startDay) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff > 0) {
        // slots for each day
        const slots = [];
        for (let i = 0; i <= daysDiff; i++) {
          const currentDay = new Date(startDay);
          currentDay.setDate(startDay.getDate() + i);

          const year = currentDay.getFullYear();
          const month = String(currentDay.getMonth() + 1).padStart(
            2,
            '0'
          );
          const day = String(currentDay.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          const existingSlot = timeSlots.find(
            (s) => s.date === dateStr
          );

          slots.push({
            date: dateStr,
            startTime: existingSlot?.startTime || '09:00',
            endTime: existingSlot?.endTime || '17:00',
          });
        }
        setTimeSlots(slots);
      } else {
        setUseTimeSlots(false);
        setTimeSlots([]);
      }
    } else if (!isMultiDay && useTimeSlots) {
      setUseTimeSlots(false);
      setTimeSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useTimeSlots, startDate, endDate, isMultiDay]);

  const updateTimeSlot = (index, field, value) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const onFormSubmit = (data) => {
    const payload = {
      ...data,
      ...(useTimeSlots && timeSlots.length > 0 && { timeSlots }),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-7">
      {/* Title */}
      <div className="space-y-1.5">
        <FieldLabel
          htmlFor="title"
          className="text-black text-sm">
          Event title *
        </FieldLabel>
        <Input
          id="title"
          type="text"
          placeholder="Enter event title"
          className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
          {...register('title')}
        />
        {errors.title && (
          <FieldError>{errors.title.message}</FieldError>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <FieldLabel
          htmlFor="description"
          className="text-black text-sm">
          Description
        </FieldLabel>
        <Textarea
          id="description"
          placeholder="Describe what this event is about"
          rows={5}
          className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
          {...register('description')}
        />
        {errors.description && (
          <FieldError>{errors.description.message}</FieldError>
        )}
      </div>

      {/* Date & Time */}
      <div className="space-y-1.5">
        <FieldLabel className="text-black text-sm">
          Event date &amp; time *
        </FieldLabel>
        <p className="text-xs text-gray-600 mb-1">
          Choose a start time. Optionally select an end time or span
          multiple days.
        </p>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4">
          <Controller
            name="startDate"
            control={control}
            render={({ field: startField }) => (
              <Controller
                name="endDate"
                control={control}
                render={({ field: endField }) => (
                  <DateTimeRangePicker
                    startValue={startField.value}
                    endValue={endField.value}
                    onStartChange={startField.onChange}
                    onEndChange={endField.onChange}
                    startError={errors.startDate?.message}
                    endError={errors.endDate?.message}
                    timeDisabled={useTimeSlots}
                  />
                )}
              />
            )}
          />
        </div>

        {(errors.startDate || errors.endDate) && (
          <div className="mt-1 space-y-0.5">
            {errors.startDate?.message && (
              <FieldError>{errors.startDate.message}</FieldError>
            )}
            {errors.endDate?.message && (
              <FieldError>{errors.endDate.message}</FieldError>
            )}
          </div>
        )}
      </div>

      {/* Time Slots for Multi-Day Events */}
      {isMultiDay && (
        <div className="space-y-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <FieldLabel className="text-black">
                Different Times for Each Day
              </FieldLabel>
              <p className="text-xs text-gray-600 mt-1">
                Specify different time ranges for each day
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUseTimeSlots(!useTimeSlots)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useTimeSlots ? 'bg-pfw-gold' : 'bg-slate-700'
              }`}>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useTimeSlots ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {useTimeSlots && timeSlots.length > 0 && (
            <div className="space-y-3 mt-4">
              {timeSlots.map((slot, index) => (
                <div
                  key={slot.date}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <FieldLabel className="text-xs text-gray-600">
                      Date
                    </FieldLabel>
                    <div className="text-sm font-medium text-black mt-1">
                      {new Date(
                        `${slot.date}T00:00:00`
                      ).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor={`slot-start-${index}`}
                      className="text-xs text-gray-600">
                      Start Time
                    </FieldLabel>
                    <Input
                      id={`slot-start-${index}`}
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        updateTimeSlot(
                          index,
                          'startTime',
                          e.target.value
                        )
                      }
                      className="mt-1 h-9 bg-gray-50 border-gray-300 text-black"
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor={`slot-end-${index}`}
                      className="text-xs text-gray-600">
                      End Time
                    </FieldLabel>
                    <Input
                      id={`slot-end-${index}`}
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        updateTimeSlot(
                          index,
                          'endTime',
                          e.target.value
                        )
                      }
                      className="mt-1 h-9 bg-gray-50 border-gray-300 text-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Location */}
      <div className="space-y-1.5">
        <FieldLabel
          htmlFor="location"
          className="text-black text-sm">
          Location / venue
        </FieldLabel>
        <Input
          id="location"
          type="text"
          placeholder="Enter event location"
          className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
          {...register('location')}
        />
        {errors.location && (
          <FieldError>{errors.location.message}</FieldError>
        )}
      </div>

      {/* Capacity & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel
            htmlFor="capacity"
            className="text-black text-sm">
            Capacity (optional)
          </FieldLabel>
          <Input
            id="capacity"
            type="number"
            min="1"
            placeholder="Max attendees"
            className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
            {...register('capacity')}
          />
          {errors.capacity && (
            <FieldError>{errors.capacity.message}</FieldError>
          )}
          <p className="text-[11px] text-gray-600">
            Leave empty for unlimited capacity.
          </p>
        </div>

        <div className="space-y-1.5">
          <FieldLabel
            htmlFor="category"
            className="text-black text-sm">
            Category (optional)
          </FieldLabel>
          <Input
            id="category"
            type="text"
            placeholder="e.g. Workshop, Social"
            className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
            {...register('category')}
          />
          {errors.category && (
            <FieldError>{errors.category.message}</FieldError>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="space-y-1.5">
        <FieldLabel
          htmlFor="points"
          className="text-black text-sm">
          Event Points
        </FieldLabel>
        <Input
          id="points"
          type="number"
          min="0"
          placeholder="Points awarded for attendance"
          className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
          {...register('points')}
        />
        {errors.points && (
          <FieldError>{errors.points.message}</FieldError>
        )}
        <p className="text-[11px] text-gray-600">
          Points earned by students for checking in.
        </p>
      </div>

      {/* Image */}
      <div className="space-y-1.5">
        <FieldLabel
          htmlFor="imageUrl"
          className="text-black text-sm">
          Event image (optional)
        </FieldLabel>
        <p className="text-[11px] text-gray-600 mb-1">
          Upload or paste a URL for the event cover image.
        </p>
        <ImageUpload
          value={imageUrl || ''}
          onChange={(url) => setValue('imageUrl', url)}
          disabled={loading}
        />
        {errors.imageUrl && (
          <FieldError>{errors.imageUrl.message}</FieldError>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-pfw-gold hover:bg-gold-dark text-white rounded-full shadow-lg shadow-pfw-gold/20 text-sm h-11">
          {loading ? 'Saving...' : submitLabel}
        </Button>
        <Link href={cancelHref} className="flex-1">
          <Button
            type="button"
            className="w-full bg-gray-100 text-black hover:bg-gray-100 border-gray-300 rounded-full text-sm h-11">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
