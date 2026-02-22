"use client";

import dynamic from "next/dynamic";

const EditWorkoutForm = dynamic(
  () => import("./EditWorkoutForm").then((m) => m.EditWorkoutForm),
  { ssr: false }
);

export { EditWorkoutForm };
