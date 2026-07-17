/**
 * ─── Driving Courses Catalog Page ─────────────────────────────
 * Course catalog for the Driving School Management System.
 */

import { useEffect, useState, useCallback } from 'react'
import { Badge, Button } from '@repo/ui-core'
import { drivingCourseRepo } from '../../../lib/db'
import type { DrivingCourse } from '@repo/entity-driving-school'
import { COURSE_CATEGORY_LABELS } from '@repo/entity-driving-school'
import { Plus, BookOpen, Clock, DollarSign, Users } from 'lucide-react'

export function DrivingCoursesPage() {
  const [courses, setCourses] = useState<DrivingCourse[]>([])
  const [loading, setLoading] = useState(true)

  const loadCourses = useCallback(async () => {
    setLoading(true)
    try {
      const result = await drivingCourseRepo.findMany({
        page: 1,
        pageSize: 100,
        sort: [{ field: 'sortOrder', direction: 'asc' }],
      })
      if ('items' in result) {
        setCourses(result.items as DrivingCourse[])
      }
    } catch (error) {
      console.error('Failed to load driving courses:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCourses() }, [loadCourses])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driving Course Catalog</h1>
          <p className="mt-1 text-sm text-gray-500">Manage courses, hours, and pricing per LTO requirements</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>Add Course</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No courses defined</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first driving course to start accepting enrollments</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <Badge color={c.ltoAccredited ? 'green' : 'yellow'}>
                  {c.ltoAccredited ? 'LTO Accredited' : 'Pending LTO'}
                </Badge>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  c.status === 'active' ? 'bg-green-100 text-green-800' :
                  c.status === 'coming_soon' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {c.status === 'active' ? 'Active' : c.status === 'coming_soon' ? 'Coming Soon' : 'Inactive'}
                </span>
              </div>

              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                {COURSE_CATEGORY_LABELS[c.category]}
              </span>
              <h3 className="font-semibold text-gray-900 text-lg mt-1 mb-2">{c.name}</h3>
              {c.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description}</p>}

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{c.totalHours}h total ({c.theoryHours}h theory + {c.practicalHours}h practical)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>Max {c.maxStudentsPerClass} students/class • Min {c.minSessionsRequired} sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Min age: {c.minimumAge} • {c.requiresStudentPermit ? 'Student permit required' : 'No permit needed'}</span>
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-gray-100 pt-3">
                <div>
                  <span className="text-2xl font-bold text-green-700">₱{c.baseTuitionFee.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 ml-1">tuition</span>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>+₱{c.registrationFee.toLocaleString()} reg</div>
                  <div>+₱{c.assessmentFee.toLocaleString()} assessment</div>
                  <div>+₱{c.certificateFee.toLocaleString()} cert</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
