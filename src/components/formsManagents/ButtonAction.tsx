import React, { SetStateAction, useEffect, useState } from 'react';
import Button from '@/components/ui/button/Button';
import { FormField, FormLinkWf, FormManager } from '../interface/FormField';
import { ConfirmationModal } from '../case/modal/ConfirmationModal';
import { useLazyGetFormLinkWfQuery, usePublishFormMutationMutation } from '@/store/api/formApi';
import { ToastContainer } from '../crud/ToastContainer';
import { useToast } from '@/hooks';
import Badge from '../ui/badge/Badge';
import { useTranslation } from '@/hooks/useTranslation';
// import { TranslationKey } from '@/types/i18n';


const ListOfWf: React.FC<{ formLinkWf: FormLinkWf[] }> = ({ formLinkWf }) => {
  const { t } = useTranslation();
  return <div> {t("form_builder.remove_workflow")}
    <div>{formLinkWf.length > 0 && (
      <div className=" rounded-lg ">
        <div className="flex flex-wrap gap-2 mt-2 max-h-20 overflow-y-auto custom-scrollbar">
          {formLinkWf.map((item) => (
            <Badge key={item.wfId}>
              {item.title}
            </Badge>
          ))}
        </div>
      </div>
    )}</div>
  </div>
}

const LoadingSpinner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">{t("common.loading")}...</span>
    </div>
  );
}

interface TableRowActionsProps {
  form: FormManager;
  handleOnEdit?: (form: FormField) => void;
  handleOnView?: () => void;
  handleOnDelete?: (form: FormField) => void;
  type?: "button" | "list";
  onSetStatusChange: (formId: string, formName: string, newStatus: boolean) => void;
  setForms: React.Dispatch<SetStateAction<FormManager[]>>
}

const ButtonAction: React.FC<TableRowActionsProps> = ({
  form,
  type = "list",
  handleOnEdit,
  handleOnView,
  setForms
}) => {
  const [showPubModal, setShowPubModal] = useState<boolean>(false);
  const [isLoadingWfData, setIsLoadingWfData] = useState<boolean>(false);
  const style = type === "list" ? "outline" : "outline";
  const [pusblishForm] = usePublishFormMutationMutation({})
  const [getFormLinkWf] = useLazyGetFormLinkWfQuery()
  const { toasts, addToast, removeToast } = useToast();
  const [SelectFormLinkWf, setSelectFormLinkWf] = useState<FormLinkWf[] | undefined>(undefined)
  const { t } = useTranslation();
  const handleOnPubUnPub = async (form: FormManager) => {
    try {
      const response = await pusblishForm({ formId: form.formId, publish: !form.publish })

      if (response?.data?.msg === "Success") {
        addToast(
          'success',
          `${!form.publish ? "Publish" : "Unpublish"} Complete.`
        );
        setForms((prev) =>
          prev.map((f) =>
            f.formId === form.formId ? { ...f, publish: !form.publish } : f
          )
        );
        setShowPubModal(false);
        return
      }
    } catch (error: any) {
      addToast(
        'error',
        `${!form.publish ? "Publish" : "Unpublish"} Failed.`
      );
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingWfData(true);
      try {
        const response = await getFormLinkWf({ formId: form.formId }).unwrap();
        if (response?.data) {
          setSelectFormLinkWf(response.data);
        }
      } catch (error: any) {
        if (error.data?.msg === "No data found") {
          setSelectFormLinkWf([]);
          return;
        }
        addToast('error', `${error.data?.msg || 'Failed to fetch workflow data'}`);
      } finally {
        setIsLoadingWfData(false);
      }
    };

    if (showPubModal && form.publish) {
      fetchData();
    }
  }, [showPubModal, form.publish, form.formId]);

  const getModalDescription = () => {
    if (!form?.publish) {
      return "คุณต้องการที่จะเปิดใช้งานฟอร์มนี้ใช่ไหม";
    }

    if (isLoadingWfData) {
      return <LoadingSpinner />;
    }

    if (SelectFormLinkWf?.length) {
      return <ListOfWf formLinkWf={SelectFormLinkWf} />;
    }

    return "คุณต้องการที่จะปิดใช้งานฟอร์มนี้ใช่ไหม";
  };

  const canConfirm = () => {
    // For publish action, always allow
    if (!form.publish) return true;

    // For unpublish, only allow if not loading and no workflows linked
    if (isLoadingWfData) return false;
    if (SelectFormLinkWf?.length) return false;

    return true;
  };

  return (
    <div className={`flex  ${type !== "list" ? "justify-between" : "  justify-end"} w-full`}>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => handleOnView?.()}
          variant={`${style}`}
          title="View"
        >
          {t("common.view")}
        </Button>
        <Button
          onClick={() => handleOnEdit?.(form)}
          variant={style}
          title="Edit"
          // disabled={
          //   (form?.versionsInfoList?.length ?? 0) > 0 &&
          //   Number(form.versions) <
          //   Math.max(...(form.versionsInfoList?.map((item)=>Number(item.version)) ?? [Number(form.versions)]))
          // }
        >
        {t("common.edit")}
        </Button>


        {type === "list" && <Button
          onClick={() => { setShowPubModal(true) }}
          variant={`outline`}
          className="w-[110px]"
        >
          {!form.publish ? t("common.publish") : t("common.unpublish")}
        </Button>
        }
      </div>
      {type != "list" && <Button
        onClick={() => { setShowPubModal(true) }}
        variant={`outline`}
        className="min-w-[110px]"
      >
        {!form.publish ? t("common.publish") : t("common.unpublish")}
      </Button>
      }


      <ConfirmationModal
        isOpen={showPubModal}
        onClose={() => {
          setShowPubModal(false);
          setSelectFormLinkWf(undefined);
          setIsLoadingWfData(false);
        }}
        onConfirm={canConfirm() ? () => handleOnPubUnPub(form) : undefined}
        title={!form?.publish ? t("common.publish") : t("common.unpublish")}
        description={getModalDescription()}
        confirmButtonVariant={!form?.publish ? "success" : "error"}
        cancelButtonText={t("common.cancel")}
        confirmButtonText={t("common.confirm")}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ButtonAction;