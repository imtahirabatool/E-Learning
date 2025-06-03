import CourseDetailsPage from "../../components/Course/CourseDetailsPage";

type Props = {
  params: Promise<{ id: string }>;
};

const Page = async ({ params }: Props) => {
  const resolvedParams = await params;
  return (
    <div>
      <CourseDetailsPage id={resolvedParams.id} />
    </div>
  );
};

export default Page;
