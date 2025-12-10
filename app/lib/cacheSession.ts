import { cache } from "react";
import { getServerSession } from "next-auth";

export const getCachedSession = cache(async () => {
    return getServerSession();
});
