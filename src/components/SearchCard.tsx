import { DefinitionSingleSearchForm } from './DefinitonSingleSearchForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

export function SearchCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>搜索</CardTitle>
        <CardDescription>请输入您想要的查询内容</CardDescription>
        <CardContent>
          <DefinitionSingleSearchForm />
        </CardContent>
      </CardHeader>
    </Card>
  );
}
