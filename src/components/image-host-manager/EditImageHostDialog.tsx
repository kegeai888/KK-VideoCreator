// Copyright (c) 2025 hotflow2024
// Licensed under AGPL-3.0-or-later. See LICENSE for details.
// Commercial licensing available. See COMMERCIAL_LICENSE.md.
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { ImageHostProvider } from "@/stores/api-config-store";

interface EditImageHostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ImageHostProvider | null;
  onSave: (provider: ImageHostProvider) => void;
}

export function EditImageHostDialog({
  open,
  onOpenChange,
  provider,
  onSave,
}: EditImageHostDialogProps) {
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [uploadPath, setUploadPath] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [apiKeyParam, setApiKeyParam] = useState("");
  const [apiKeyHeader, setApiKeyHeader] = useState("");
  const [expirationParam, setExpirationParam] = useState("");
  const [imageField, setImageField] = useState("");
  const [nameField, setNameField] = useState("");
  const [responseUrlField, setResponseUrlField] = useState("");
  const [responseDeleteUrlField, setResponseDeleteUrlField] = useState("");

  useEffect(() => {
    if (provider) {
      setName(provider.name || "");
      setBaseUrl(provider.baseUrl || "");
      setUploadPath(provider.uploadPath || "");
      setApiKey(provider.apiKey || "");
      setEnabled(provider.enabled ?? true);
      setApiKeyParam(provider.apiKeyParam || "");
      setApiKeyHeader(provider.apiKeyHeader || "");
      setExpirationParam(provider.expirationParam || "");
      setImageField(provider.imageField || "");
      setNameField(provider.nameField || "");
      setResponseUrlField(provider.responseUrlField || "");
      setResponseDeleteUrlField(provider.responseDeleteUrlField || "");
    }
  }, [provider]);

  const buildPayload = (): ImageHostProvider | null => {
    if (!provider) return null;
    return {
      ...provider,
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      uploadPath: uploadPath.trim(),
      apiKey: apiKey.trim(),
      enabled,
      apiKeyParam: apiKeyParam.trim() || undefined,
      apiKeyHeader: apiKeyHeader.trim() || undefined,
      expirationParam: expirationParam.trim() || undefined,
      imageField: imageField.trim() || undefined,
      nameField: nameField.trim() || undefined,
      responseUrlField: responseUrlField.trim() || undefined,
      responseDeleteUrlField: responseDeleteUrlField.trim() || undefined,
    };
  };

  const handleSave = () => {
    if (!provider) return;
    if (!name.trim()) { toast.error("请输入名称"); return; }
    if (!baseUrl.trim() && !uploadPath.trim()) { toast.error("请配置 Base URL 或 Upload Path"); return; }
    if (!apiKey.trim()) { toast.error("请输入 API Key"); return; }
    const payload = buildPayload();
    if (payload) { onSave(payload); toast.success("已保存更改"); }
    onOpenChange(false);
  };

  // 关闭时若 apiKey 已填写则自动保存
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && apiKey.trim() && provider) {
      const payload = buildPayload();
      if (payload) { onSave(payload); toast.success("已自动保存"); }
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-1">
          <DialogTitle>编辑图床服务商</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex flex-col gap-3 py-2">
            {/* 第一行：平台 + 名称 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">平台</Label>
                <Input value={provider?.platform || ""} disabled className="bg-muted h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">名称</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="图床名称" className="h-8 text-sm" />
              </div>
            </div>

            {/* 第二行：Base URL + Upload Path */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Base URL</Label>
                <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.example.com" className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Upload Path / URL</Label>
                <Input value={uploadPath} onChange={(e) => setUploadPath(e.target.value)} placeholder="/upload 或完整 URL" className="h-8 text-sm" />
              </div>
            </div>

            {/* API Keys */}
            <div className="space-y-1">
              <Label className="text-xs">API Keys</Label>
              <Textarea
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入 API Keys（每行一个，或用逗号分隔）"
                className="font-mono text-sm min-h-[60px] max-h-[80px]"
              />
            </div>

            {/* 启用 */}
            <div className="flex items-center justify-between py-0.5">
              <Label className="text-xs">启用</Label>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            {/* 高级配置 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">高级配置（可选）</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "API Key Query 参数", value: apiKeyParam, setter: setApiKeyParam, placeholder: "key" },
                  { label: "API Key Header", value: apiKeyHeader, setter: setApiKeyHeader, placeholder: "Authorization" },
                  { label: "过期参数", value: expirationParam, setter: setExpirationParam, placeholder: "expiration" },
                  { label: "图片字段名", value: imageField, setter: setImageField, placeholder: "image" },
                  { label: "名称字段名", value: nameField, setter: setNameField, placeholder: "name" },
                  { label: "返回 URL 字段", value: responseUrlField, setter: setResponseUrlField, placeholder: "data.url" },
                  { label: "删除 URL 字段", value: responseDeleteUrlField, setter: setResponseDeleteUrlField, placeholder: "data.delete_url" },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label} className="space-y-0.5">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <Input value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} className="h-7 text-xs" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>取消</Button>
          <Button size="sm" onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
