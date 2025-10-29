import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { useState } from 'react';
import { DefinitionSingleSearchForm } from './DefinitonSingleSearchForm';
import { Card, CardContent, CardHeader } from './ui/card';
import { Switch } from './ui/switch';
import { RelationSingleSearchForm } from './RelationSingleSearchForm';

export function SearchCard() {
  const [isRelation, setIsRelation] = useState(false);

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>搜索</CardTitle> */}
        {/* <CardDescription>请输入您想要的查询内容</CardDescription> */}
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="definition"
          value={isRelation ? 'relation' : 'definition'}
        >
          <TabsList>
            <div className="flex gap-3">
              <TabsTrigger value="definition">查询定义</TabsTrigger>
              <Switch checked={isRelation} onCheckedChange={() => setIsRelation(!isRelation)} />
              <TabsTrigger value="relation">查询关系</TabsTrigger>
            </div>
          </TabsList>
          <TabsContent value="definition">
            <DefinitionSingleSearchForm />
          </TabsContent>
          <TabsContent value="relation">
            <RelationSingleSearchForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
