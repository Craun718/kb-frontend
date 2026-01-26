import { DefinitionSingleSearchForm } from './DefinitonSearchForm';
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
        <CardDescription>搜索结果由大模型提供，请自行辨别</CardDescription>
      </CardHeader>
      <CardContent>
        <DefinitionSingleSearchForm />
      </CardContent>
    </Card>
  );
}
