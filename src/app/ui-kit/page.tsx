import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "UI kit · Tech Repair" };

export default function UiKitPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">UI kit</h1>
        <ThemeToggle />
      </header>

      <section className="flex flex-wrap gap-2" aria-label="Buttons">
        <Button>Submit request</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Decline</Button>
      </section>

      <section className="flex flex-wrap gap-2" aria-label="Status badges">
        <Badge variant="neutral">New</Badge>
        <Badge variant="info">Diagnosing</Badge>
        <Badge variant="warning">Awaiting approval</Badge>
        <Badge variant="success">Ready for pickup</Badge>
        <Badge variant="danger">Declined</Badge>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>New repair request</CardTitle>
          <CardDescription>We reply within one business day.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="model">Brand &amp; model</Label>
            <Input id="model" placeholder="e.g. iPhone 14 Pro" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="problem">What&apos;s going on?</Label>
            <Textarea id="problem" />
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-mono">TR-1048</TableCell>
            <TableCell>MacBook Air M1 (2020)</TableCell>
            <TableCell>
              <Badge variant="warning">Awaiting approval</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </main>
  );
}
