import { isAttachment } from "@/components/Attachment/AttachmentConv";
import { FileItem } from "@/types/case";
import { UploadFileRes } from "@/types/file";


export const uploadFileToServer = async (files: File[], postUploadFile: any, caseId?: string): Promise<UploadFileRes[]> => {
    const results: UploadFileRes[] = [];
    for (const file of files) {
        try {
            const result = await postUploadFile({
                path: "case",
                file,
                caseId: caseId ?? "",
            }).unwrap();

            if (result.data) {
                results.push(result.data);
                console.log(`✅ Uploaded: ${file.name} -> attId: ${result.data.attId}`);
            } else {
                console.error(`⚠️ Failed to upload ${file.name}`);
            }
        } catch (error) {
            console.error(`❌ Upload failed for ${file.name}:`, error);
        }
    }

    return results;
};

export const handleFileChanges = async (
    currentFiles: FileItem[],
    originalFiles: FileItem[],
    caseId: string,
    delFileApi: any,
): Promise<{ uploaded: UploadFileRes[]; deleted: string[]; errors: string[]; remainingAttachments: FileItem[] }> => {
    const uploaded: UploadFileRes[] = [];
    const deleted: string[] = [];
    const errors: string[] = [];
    // Separate attachments (from server) and local File objects (new)
    const originalAttachments = originalFiles.filter(isAttachment);
    const currentAttachments = currentFiles.filter(isAttachment);
    const newLocalFiles = currentFiles.filter((file): file is File => !isAttachment(file));

    console.log(`📊 File changes - Original: ${originalAttachments.length}, Current: ${currentAttachments.length}, New: ${newLocalFiles.length}`);

    // 🗑 Identify attachments that were removed
    const attachmentsToDelete = originalAttachments.filter(
        (oldFile) => !currentAttachments.some((newFile) => newFile.attId === oldFile.attId)
    );

    // Delete removed attachments from server
    if (attachmentsToDelete.length > 0) {
        console.log(`🗑 Deleting ${attachmentsToDelete.length} file(s) from server...`);

        for (const file of attachmentsToDelete) {
            try {
                console.log(`Deleting: ${file.attName} (${file.attId})`);

                const result = await delFileApi({
                    attId: file.attId,
                    caseId: caseId,
                    filename: file.attName,
                    path: "case",
                }).unwrap(); // Using .unwrap() for proper error handling

                console.log('Delete API response:', result);

                if (result?.data || result?.msg?.toLowerCase() === 'success') {
                    deleted.push(file.attId);
                    console.log(`✅ Successfully deleted ${file.attName}`);
                } else {
                    errors.push(`Failed to delete ${file.attName}`);
                    console.error(`❌ Failed to delete ${file.attName}:`, result);
                }
            } catch (error: any) {
                console.error(`❌ Delete API error for ${file.attName}:`, error);
                errors.push(`Error deleting: ${file.attName} - ${error.message || 'Unknown error'}`);
            }
        }
    }

    // 📤 Upload only new local files
    if (newLocalFiles.length > 0) {
        console.log(`📤 Uploading ${newLocalFiles.length} new file(s)...`);
        try {
            const uploadResults = await uploadFileToServer(newLocalFiles, caseId);
            uploaded.push(...uploadResults);
            console.log(`✅ Uploaded ${uploadResults.length}/${newLocalFiles.length} file(s)`);

            if (uploadResults.length !== newLocalFiles.length) {
                errors.push(`Only uploaded ${uploadResults.length}/${newLocalFiles.length} files`);
            }
        } catch (error: any) {
            console.error(`❌ Upload error:`, error);
            errors.push(`Upload failed: ${error.message || 'Unknown error'}`);
        }
    }

    // Return remaining attachments (ones that weren't deleted)
    const remainingAttachments = currentAttachments;

    console.log(`📊 Summary - Deleted: ${deleted.length}, Uploaded: ${uploaded.length}, Remaining: ${remainingAttachments.length}, Errors: ${errors.length}`);

    return { uploaded, deleted, errors, remainingAttachments };
};
