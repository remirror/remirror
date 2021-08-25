---
slug: serverless-collaborative-editing
title: Serverless collaborative editing
author: Ronny Roeller
author_title: Remirror Maintainer
author_url: https://github.com/ronnyroeller
author_image_url: https://avatars.githubusercontent.com/u/9339055?v=4
tags: [remirror, pattern]
---

_TLDR: Adding collaborative editing via webrtc and Lambda/DynamoDB-powered signaling server_

<!-- truncate -->

Editing richtext is a core feature of our application. When more and more users asked to work together in the same document, it was time to add collaborative editing.

For that, [Yjs](https://yjs.dev/) looked like the natural choice because Remirror/Prosemirror, which power our editor, comes with a great out-of-the-box integration. But what about serverless?

Out initial enthusiasm cooled down considerable when we realized that the typical Yjs setup propagates changes via a central server to all connected browsers. Worse, the central server had to keep all data in memory to merge changes.

A persistent server that keeps data in memory wasn’t going to fly in our serverless architecture.

## Peer-to-peer collaboration

Fortunately, Yjs offers an alternative approach to propagate changes: browsers can sync changes via webrtc. The peer-to-peer communication completely eliminates the need for a central server.

Yet, no central server implies also that the document exists only in the browsers of the user who currently work on the document. Once everyone closes their browser: the document is gone forever.

To persist the document nonetheless, we have the browser send snapshots to our API every couple of seconds. When a user opens the document, we try to fetch it via webrtc from another user. If the user is the first opening the document, we go back to our API and load the persisted state from there.

Note: This [Github repo](https://github.com/Collaborne/remirror-yjs-webrtc-demo) contains an in-depth analysis and the PoC of our approach.

## Serverless signaling

As a final twist, webrtc introduced a new centralized piece: Users need to know who else opened the document, so that they can set up peer-to-peer connections. That’s where the central webrtc signaling server comes in: it acts as an address book of who else is at the same party.

Yjs offers an [example signaling server](https://github.com/yjs/y-webrtc/blob/master/bin/server.js), which proved to be a great starting point. Yet — again — we needed signaling to be serverless. So, we took Yjs’ example server, and made it run through a websocket API with AWS ApiGateway. The connections/rooms are stored in a DynamoDB table, and the actual handler is a single Lambda function: https://gist.github.com/ronnyroeller/6d244c5bcee2d71c346bf39c7fa04bad#file-signaling-server-ts

We use CloudFormation for deployment, and our resources related to the signaling server look roughly like this: https://gist.github.com/ronnyroeller/e0e524eed1a7cf9a9fa884a2bee53258#file-signaling-servier-cloudformation-yml

Happy coding!

_This post was originally published on [Medium](https://medium.com/collaborne-engineering/serverless-yjs-72d0a84326a2)._
