"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  PaperclipIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useFileUpload } from "@/hooks/use-file-upload";
import { uploadFile } from "@/functions/upload-file";

export default function UploadAgent() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept:
      "text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
  });

  const file = files[0];

  async function Sumbit() {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file.file as File);
    const response = await uploadFile(formData);
    if (response.success) {
      toast.success(response.message);
      setLoading(false);
      setOpen(false);
      return;
    }
    toast.error(response.error);
    setLoading(false);
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="font-medium">
          <FileUp />
          Upload File
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upload File</AlertDialogTitle>
          <AlertDialogDescription>
            Upload a new file to create tasks
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          <div
            role="button"
            onClick={openFileDialog}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-dragging={isDragging || undefined}
            className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-input p-4 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
          >
            <input
              {...getInputProps()}
              className="sr-only"
              aria-label="Upload file"
              disabled={Boolean(file)}
            />

            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                aria-hidden="true"
              >
                <UploadIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">Upload file</p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to browse
              </p>
            </div>
          </div>

          {errors.length > 0 && (
            <div
              className="flex items-center gap-1 text-xs text-destructive"
              role="alert"
            >
              <AlertCircleIcon className="size-3 shrink-0" />
              <span>{errors[0]}</span>
            </div>
          )}
          {file && (
            <div className="space-y-2">
              <div
                key={file.id}
                className="flex items-center justify-between gap-2 rounded-xl border px-4 py-2"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <PaperclipIcon
                    className="size-4 shrink-0 opacity-60"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">
                      {file.file.name}
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                  onClick={() => removeFile(files[0]?.id)}
                  aria-label="Remove file"
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={Sumbit} disabled={loading}>
            {loading && <Spinner />} Upload
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
