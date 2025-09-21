import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Folder, File, Search, Upload, Download, Eye } from "lucide-react";
import Header from "@/components/Header";

const Files = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockFiles = [
    {
      id: 1,
      name: "Договор поставки №123.pdf",
      type: "pdf",
      size: "2.3 MB",
      uploadedAt: "2024-01-15",
      status: "Подписан",
      folder: "Договоры"
    },
    {
      id: 2,
      name: "Спецификация товаров.xlsx",
      type: "xlsx",
      size: "1.5 MB",
      uploadedAt: "2024-01-14",
      status: "На рассмотрении",
      folder: "Документы"
    },
    {
      id: 3,
      name: "Фото товара.jpg",
      type: "jpg",
      size: "3.2 MB",
      uploadedAt: "2024-01-13",
      status: "Утверждено",
      folder: "Изображения"
    },
    {
      id: 4,
      name: "Инструкция по эксплуатации.docx",
      type: "docx",
      size: "856 KB",
      uploadedAt: "2024-01-12",
      status: "Черновик",
      folder: "Документы"
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <File className="h-5 w-5 text-red-500" />;
      case "xlsx":
        return <File className="h-5 w-5 text-green-500" />;
      case "jpg":
        return <File className="h-5 w-5 text-blue-500" />;
      case "docx":
        return <File className="h-5 w-5 text-blue-600" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Подписан":
      case "Утверждено":
        return "bg-green-100 text-green-800";
      case "На рассмотрении":
        return "bg-yellow-100 text-yellow-800";
      case "Черновик":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredFiles = mockFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.folder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header/>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Файлы</h1>
            <p className="text-muted-foreground">Управление документами и файлами</p>
          </div>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Загрузить файл
          </Button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск файлов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <h3 className="font-medium">{file.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Folder className="h-3 w-3" />
                        <span>{file.folder}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(file.status)}>
                      {file.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Файлы не найдены</h3>
              <p className="text-muted-foreground">Попробуйте изменить поисковый запрос</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>

  );
};

export default Files;