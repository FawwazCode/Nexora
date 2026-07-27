interface RegisterHeaderProps {
  title: string;
  description: string;
}

export default function RegisterHeader({
  title,
  description,
}: RegisterHeaderProps) {
  return (
    <div className="space-y-2 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {title}
      </h1>

      <p className="text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}