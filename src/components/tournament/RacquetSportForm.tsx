import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const playerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["male", "female"]),
  mobile: z.string().regex(/^[0-9]{10}$/, "Invalid mobile number"),
  college: z.string().optional(),
  age: z.string()
    .regex(/^\d+$/, "Age must be a number")
    .refine((val) => parseInt(val) >= 16 && parseInt(val) <= 30, {
      message: "Age must be between 16 and 30",
    }),
});

type PlayerData = z.infer<typeof playerSchema>;

interface SinglePlayerForm {
  player1: PlayerData;
}

interface DoublePlayerForm {
  player1: PlayerData;
  player2: PlayerData;
}

type FormData = SinglePlayerForm | DoublePlayerForm;

interface RacquetSportFormProps {
  playType: "singles" | "doubles" | "mixed";
  onSubmit: (data: FormData) => void;
  onBack: () => void;
}

export function RacquetSportForm({
  playType,
  onSubmit,
  onBack,
}: RacquetSportFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(playType === "singles" ? 
      z.object({ player1: playerSchema }) : 
      z.object({ player1: playerSchema, player2: playerSchema })
    ),
    defaultValues: {
      player1: {
        name: "",
        gender: "male",
        mobile: "",
        college: "",
        age: "",
      },
      ...(playType !== "singles" && {
        player2: {
          name: "",
          gender: playType === "mixed" ? "female" : "male",
          mobile: "",
          college: "",
          age: "",
        },
      }),
    },
  });

  const PlayerForm = ({ prefix }: { prefix: "player1" | "player2" }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {prefix === "player1" ? "Player 1" : "Player 2"} Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`${prefix}.name` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.gender` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={playType === "mixed"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.mobile` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="10-digit mobile number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.age` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter age" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.college` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>College (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter college name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <PlayerForm prefix="player1" />
          {playType !== "singles" && (
            <>
              <Separator className="my-6" />
              <PlayerForm prefix="player2" />
            </>
          )}
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button type="submit">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
} 