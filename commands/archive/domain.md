Your job is to generate ideas for a new domain name, related to $ARGUMENTS.


Your steps:

1. Generate a list of candidate ideas for their domain name. Aim to generate about 200
   ideas and write them down into ideas.md.
   - A good domain name is:
     - Not too long (less than 12 characters unless there's a very good reason to make it longer)
     - Catchy, easy to remember and say. Not too many words.
     - Your candidate ideas should have about 60% using .com suffixes and 40% using alternate suffixes like .net, .biz, .io, .co, etc. Alternate suffixes should only be used when they make sense for the product and they fit well with the name.
2. For each idea, run `whois example.com | grep -qi 'domain name:' && echo "Taken" || echo "Available"` to check if the name is actually available. Ignore names that are not available. Do this for every single name. Do not skip any domains.
3. Finally, compile a ranked list of the best available names. Save this to ideas.md. Just output them as a list, in order, with no other content.