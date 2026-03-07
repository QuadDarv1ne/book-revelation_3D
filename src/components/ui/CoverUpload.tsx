"use client";

import { useCallback, useState, useRef } from "react";
import { useBookTextures } from "@/hooks/use-scene-controls";
import { useScreenReaderAnnouncement } from "@/hooks/use-accessibility";

interface CoverUploadProps {
  onUpload?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function CoverUpload({ onUpload, onError }: CoverUploadProps) {
  const { setCoverImage, setSpineImage, setBackCoverImage } = useBookTextures();
  const { announce } = useScreenReaderAnnouncement();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Неподдерживаемый формат файла. Используйте JPEG, PNG или WebP.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Файл слишком большой. Максимальный размер 5MB.";
    }

    return null;
  }, []);

  const processImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        // Создаем изображение для проверки размеров
        const img = new Image();
        img.onload = () => {
          // Проверяем минимальные размеры
          if (img.width < 400 || img.height < 600) {
            reject(new Error("Изображение слишком маленькое. Минимум 400x600px."));
            return;
          }
          resolve(result);
        };
        img.onerror = () => reject(new Error("Ошибка при загрузке изображения."));
        img.src = result;
      };
      
      reader.onerror = () => reject(new Error("Ошибка при чтении файла."));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      announce(validationError, "assertive");
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await processImage(file);
      
      setCoverImage(imageUrl);
      setSpineImage(imageUrl); // Временно используем то же изображение
      setBackCoverImage(imageUrl);
      
      setPreview(imageUrl);
      onUpload?.(imageUrl);
      
      const successMessage = "Обложка успешно загружена!";
      announce(successMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка при загрузке обложки";
      onError?.(errorMessage);
      announce(errorMessage, "assertive");
    } finally {
      setIsUploading(false);
      // Сбрасываем value инпута, чтобы можно было загрузить тот же файл снова
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [validateFile, processImage, setCoverImage, setSpineImage, setBackCoverImage, onUpload, onError, announce]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const clearPreview = useCallback(() => {
    setPreview(null);
    setCoverImage(undefined);
    setSpineImage(undefined);
    setBackCoverImage(undefined);
    announce("Пользовательская обложка удалена");
  }, [setCoverImage, setSpineImage, setBackCoverImage, announce]);

  return (
    <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Загрузить свою обложку</h3>
        {preview && (
          <button
            onClick={clearPreview}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
            aria-label="Удалить пользовательскую обложку"
          >
            Удалить
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        id="cover-upload"
        disabled={isUploading}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative flex flex-col items-center justify-center gap-2
          p-6 border-2 border-dashed rounded-lg cursor-pointer
          transition-all duration-200
          ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5"}
          ${preview ? "border-green-500/50 bg-green-500/5" : "border-white/20 hover:border-white/40"}
        `}
        aria-labelledby="cover-upload-label"
        aria-busy={isUploading}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-xs text-white/60">Обработка...</span>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-green-400">Обложка загружена</span>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-center">
              <p id="cover-upload-label" className="text-sm text-white/80">
                Нажмите или перетащите файл
              </p>
              <p className="text-xs text-white/40 mt-1">
                JPEG, PNG, WebP до 5MB
              </p>
            </div>
          </>
        )}
      </div>

      {preview && (
        <div className="mt-2">
          <p className="text-xs text-white/60 mb-2">Предпросмотр:</p>
          <div className="relative w-20 h-28 rounded overflow-hidden border border-white/10">
            <img src={preview} alt="Предпросмотр обложки" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}
