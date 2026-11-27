import { cn } from "@/lib/utils";

// The sentence form's type and underline styles, shared by its fields and dropdowns.

// Secondary text (helper, counter, small print) and the links set in it: 14px.
export const SMALL = "text-[14px] font-normal leading-normal text-[#f5f1e8]/60";
export const SMALL_LINK = "inline-flex items-center text-[14px] font-medium text-[#3fcfca] underline-offset-4 hover:underline";

// Field text (typed values) and placeholders: values 600 off-white; blanks italic teal at 45%,
// so an empty field never reads like the words around it.
export const FIELD_TEXT =
  "peer w-full min-w-0 border-0 bg-transparent px-0 pb-[6px] pt-0 font-semibold text-[#f5f1e8] placeholder:font-normal placeholder:italic placeholder:text-[#3fcfca]/45 focus:outline-none";

// Underline under a field: dashed while empty, solid once filled; teal draws over it on focus.
export function baseLine(empty: boolean) {
  return cn(
    "pointer-events-none absolute inset-x-0 bottom-0 border-b-2 transition-colors group-hover/line:border-[#3fcfca]/50",
    empty ? "border-dashed border-[#f5f1e8]/25" : "border-solid border-[#f5f1e8]/35",
  );
}
