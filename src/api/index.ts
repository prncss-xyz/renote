import { NoteMeta } from "@/core/models";

interface Data {
  meta: NoteMeta;
  contents: string;
}

export async function pushSync({ meta }: Data) {
  console.log(meta.id, "pushSync");
}
