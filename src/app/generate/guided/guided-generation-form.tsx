"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const guidedGenerationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters long"),
});

type FormValues = z.infer<typeof guidedGenerationSchema>;

export function GuidedGenerationForm() {
  const generateGuidedStory = useMutation(
    api.guidedStory.generateGuidedStoryMutation
  );
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(guidedGenerationSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    setIsPending(true);
    generateGuidedStory(values)
      .then((newStoryId) => {
        router.push(`/stories/${newStoryId}/refine`);
        toast({
          title: "Story created",
          description:
            "Your guided story is being generated. You'll be able to refine it soon.",
        });
        form.reset();
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "Failed to create your guided story",
          description: "Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  const fillYTShortTemplate = () => {
    form.setValue(
      "description",
      `Generate a 130-word max video script that is five short paragraphs.
    
It should include a catchy hook or intro, a clear main learning point, and actionable advice for the viewer to try.
    
The topic of the script should match a title called: ${form.getValues("title")}`
    );
  };

  return (
    <Card className="w-full bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-2xl font-semibold text-gray-800">
          Enter a Prompt
          <Button
            type="button"
            variant={"outline"}
            onClick={fillYTShortTemplate}
            className="text-sm"
          >
            YT Short Template (60 seconds)
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Title{" "}
                    <span className="text-xs text-gray-400">
                      (will be used in template)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Maskering Social Media Algorithms: Your Key to Success"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Story Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Generate a 130-word max video script that is five short paragraphs.

It should include a catchy hook or intro, a clear main learning point, and actionable advice for the viewer to try.

The topic of the script should match a title called: Maskering Social Media Algorithms: Your Key to Success`}
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Generate Guided Story (1 credits)
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
