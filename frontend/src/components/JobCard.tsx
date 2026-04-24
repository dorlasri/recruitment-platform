import Link from 'next/link';
import { MapPin, Users, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  region?: string;
  salary?: string;
  description: string;
  skills?: string[];
  applicationsCount?: number;
  createdAt: string;
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/jobs/${job._id}`}>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {job.title}
            </h3>
          </Link>
          <p className="text-primary-600 font-medium mt-0.5">{job.companyName}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {job.region && job.region !== 'אחר' && (
            <span className="badge bg-indigo-50 text-indigo-700 text-xs">{job.region}</span>
          )}
          <Link href={`/jobs/${job._id}/apply`} className="btn-primary text-sm">
            הגש מועמדות
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {job.location}
        </span>
        {job.salary && (
          <span className="font-medium text-green-700">
            {job.salary}
          </span>
        )}
        {job.applicationsCount !== undefined && (
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {job.applicationsCount} מועמדים
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatDate(job.createdAt)}
        </span>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {job.skills.slice(0, 5).map(skill => (
            <span key={skill} className="badge bg-primary-50 text-primary-700">{skill}</span>
          ))}
          {job.skills.length > 5 && (
            <span className="badge bg-gray-100 text-gray-500">+{job.skills.length - 5}</span>
          )}
        </div>
      )}

      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{job.description}</p>
    </div>
  );
}
