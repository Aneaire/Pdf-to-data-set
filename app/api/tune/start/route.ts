// app/api/tune/start/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("API Key not found.");
    return NextResponse.json(
      { error: "Server configuration error: API Key missing." },
      { status: 500 }
    );
  }

  try {
    // --- Get parameters from the request body ---
    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request body: Malformed JSON." },
        { status: 400 }
      );
    }

    const {
      displayName, // A user-friendly name for your tuned model
      baseModel = "models/gemini-1.5-flash-001-tuning", // Default or from request
      trainingDataUri, // e.g., "gs://your-bucket-name/your-data.jsonl"
      // Optional hyperparameters can also be passed in the body
      // epochs, batchSize, learningRate
    } = body;

    if (
      !displayName ||
      typeof displayName !== "string" ||
      displayName.trim() === ""
    ) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid required field: displayName (must be a non-empty string)",
        },
        { status: 400 }
      );
    }
    // if (
    //   !trainingDataUri ||
    //   typeof trainingDataUri !== "string"
    //   // !trainingDataUri.startsWith("gs://")
    // ) {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "Missing or invalid required field: trainingDataUri (must be a GCS URI string like gs://...)",
    //     },
    //     { status: 400 }
    //   );
    // }
    if (
      !baseModel ||
      typeof baseModel !== "string" ||
      !baseModel.startsWith("models/")
    ) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid field: baseModel (must be a model ID string like models/...)",
        },
        { status: 400 }
      );
    }

    // --- Construct the Request Body for the Google API ---
    // Refer to the official Google AI documentation for the exact structure
    const requestBody = {
      displayName: displayName,
      description: `Tuned model based on ${baseModel}. Data: ${trainingDataUri}`, // Optional
      baseModel: baseModel,
      tuningTask: {
        trainingData: {
          examples: {
            examples: [
              [
                {
                  text_input:
                    "What is the broadened focus of the study and practice of marketing?",
                  output:
                    "The study and practice of marketing have broadened considerably, from an emphasis on marketing as a functional management issue, to a wider focus on the strategic role of marketing in overall corporate strategy.",
                },
                {
                  text_input:
                    "What three key dimensions should firms develop their marketing strategy around in a global environment?",
                  output:
                    "In such a global environment, firms should develop their marketing strategy around three key-dimensions: (1) standardization-adaptation, (2) configuration-coordination, and (3) strategic integration.",
                },
                {
                  text_input:
                    "Define a firm's marketing strategy according to Sudharshan (1995).",
                  output:
                    "Following Sudharshan (1995), we define a firm’s marketing strategy as the development of and decisions about a firm’s relationships with its key stakeholders, its offerings, resource allocation, and timing.",
                },
                {
                  text_input:
                    "What is the first dimension of a multinational corporation's worldwide marketing strategy?",
                  output:
                    "The first, and perhaps the most important dimension of a multinational corporation (MNC)’s worldwide marketing strategy is related to the standardization or adaptation of marketing programs, such as product offering, promotional mix, price, and channel structure, across different countries.",
                },
                {
                  text_input:
                    "What is the second dimension of a worldwide marketing strategy?",
                  output:
                    "The second dimension of a worldwide marketing strategy focuses on configuration and coordination of a firm’s value chain activities across countries.",
                },
                {
                  text_input:
                    "What is the third dimension of a worldwide marketing strategy?",
                  output:
                    "The third dimension is the strategic integration dimension, which is concerned with how a MNC’s competitive battles are planned and executed across country markets.",
                },
                {
                  text_input:
                    "What is the integration-responsiveness framework?",
                  output:
                    "A dominant conceptualization for examining the configuration of these three dimensions within worldwide marketing strategies is the integration-responsiveness framework. This framework suggests that two salient imperatives simultaneously confront a business competing internationally.",
                },
                {
                  text_input:
                    "What are the two imperatives that simultaneously confront a business competing internationally according to the integration-responsiveness framework?",
                  output:
                    "A MNC, to secure competitive advantages vis-à-vis the domestic firm, must exploit market imperfections that are derived through multi-country capacities. However, given that the MNC is operating in several countries, it must also be responsive to the demands imposed by local governmental and market forces in each country.",
                },
                {
                  text_input:
                    "What are the four generic worldwide strategies identified by Bartlett and Ghoshal?",
                  output:
                    "Bartlett and Ghoshal have identified four generic worldwide strategies: (1) an international strategy, (2) a multinational (or multidomestic) strategy, (3) a global strategy, and (4) a transnational strategy.",
                },
                {
                  text_input: "Briefly describe an international strategy.",
                  output:
                    "An international strategy is a strategy in which strategic and operational decisions are developed in the home and only subsequently transferred abroad to be adapted to the local market.",
                },
                {
                  text_input: "Briefly describe a multinational strategy.",
                  output:
                    "A multinational (or multidomestic) strategy is a strategy in which strategic and operational decisions are decentralized to the strategic business unit in each country so as to allow that unit to adapt products to the local market.",
                },
                {
                  text_input: "Briefly describe a global strategy.",
                  output:
                    "A global strategy is a strategy through which a firm offers standardized products across country markets with competitive strategy being dictated by the home office.",
                },
                {
                  text_input: "Briefly describe a transnational strategy.",
                  output:
                    "A transnational strategy is a strategy through which a firm seeks to achieve both global efficiency and local responsiveness by coordinating and integrating activities across countries.",
                },
                {
                  text_input:
                    "What are the three key dimensions of an MNC's worldwide marketing strategy?",
                  output:
                    "The three key-dimensions of an MNC’s worldwide marketing strategy are: (1) standardization-adaptation, (2) configuration-coordination, and (3) strategic integration.",
                },
                {
                  text_input:
                    "Explain Standardization/Adaptation in the context of MNC's worldwide marketing strategy.",
                  output:
                    "Standardization/Adaptation refers to the use of basically the same (standardization) or different (adaptation) product or service, advertising, distribution channels, and other elements of the marketing mix across countries.",
                },
                {
                  text_input:
                    "What is Configuration in the context of an MNC's value chain?",
                  output:
                    "Configuration is the way in which an MNC configures its upstream, downstream and internal value-adding activities. A firm may choose to concentrate its activities in one country and to export and market its products and services in a range of foreign countries. Alternatively, a firm may decide to disperse its value-adding activities to several countries.",
                },
                {
                  text_input:
                    "Explain Strategic Integration in the context of an MNC's competitive battles.",
                  output:
                    "Strategic Integration is concerned with how an MNC’s competitive battles are planned and executed across country markets. A key to worldwide marketing strategy success is participation in all major world markets to gain competitive leverage and effective integration of the firm’s competitive campaigns across these markets.",
                },
                {
                  text_input:
                    "How does a firm's worldwide strategy get shaped?",
                  output:
                    "A firm’s worldwide strategy is shaped not only by its current external environment but also by its past internal management biases. In particular, MNCs are influenced by the path by which they developed and the values, norms, and practices of their management.",
                },
                {
                  text_input:
                    "What are Hofstede's five key cultural dimensions?",
                  output:
                    "Hofstede’s study described national cultural differences along five key dimensions: Power Distance (PDI), Individualism (IDV), Masculinity (MAS), Uncertainty Avoidance (UAV), and Long-Term Orientation (LTO).",
                },
                {
                  text_input:
                    "What are the four generic worldwide strategies identified by Bartlett and Ghoshal?",
                  output:
                    "Bartlett and Ghoshal have identified four generic worldwide strategies: (1) an international strategy; (2) a multinational strategy; (3) a global strategy; and finally (4) a transnational strategy.",
                },
                {
                  text_input:
                    "Explain the three basic marketing adaptation options for a firm following an international strategy.",
                  output:
                    "Traditionally, a firm following an international strategy can choose between one of three basic marketing adaptation options: (1) product standardization-communication adaptation, (2) product adaptation-communication standardization, or (3) product adaptation-communication adaptation.",
                },
                {
                  text_input:
                    "What are the forces for localization in a multinational strategy?",
                  output:
                    "Forces for localization include culture-driven differences in national tastes and preferences; government policies that demand high levels of local content; technological developments such as flexible manufacturing that have dramatically reduced the minimum efficient scale of production for some products; and the greater role of maintenance, financing and other services as tools of competition as customers become more demanding.",
                },
                {
                  text_input:
                    "How do firms following a global strategy gain a competitive advantage?",
                  output:
                    "They try to gain a competitive advantage through building global efficiencies through economies of scale and economies of scope.",
                },
                {
                  text_input:
                    "Explain economies of scale and scope in the context of global strategies.",
                  output:
                    "Scale efficiency is used as a competitive tool primarily because it has the potential to yield reduction in production costs by spreading the fixed costs over a higher volume of output. Economies of scope exit when “it is less costly to combine two or more product lines in one firm than to produce them separately.”",
                },
                {
                  text_input:
                    "What is the underlying assumption of a global strategy?",
                  output:
                    "The underlying assumption is that national tastes and preferences are more similar than different, or that they can be made similar by providing customers with standardized products with adequate cost and quality advantages over those national varieties that they have been used to.",
                },
                {
                  text_input:
                    "What are the countervailing forces of localization that emerged due to the success of global strategies?",
                  output:
                    "Customers contributed to the strengthening of the localizing forces by rejecting homogenized global products and reasserting their national preferences, albeit without relaxing their expectation of high-quality and low costs that global products had offered.",
                },
                {
                  text_input: "What is a transnational strategy?",
                  output:
                    "The emerging requirement was for companies to become more responsive to local needs while retaining their global efficiency, an emerging approach to worldwide management that Bartlett and Ghoshal call the transnational strategy.",
                },
                {
                  text_input:
                    "How do key activities and resources get distributed in a transnational strategy?",
                  output:
                    "In such firms, key activities and resources are neither centralized in the parent company, nor decentralized so that each subsidiary can carry out its own tasks on a local-for-local basis. Instead, the resources and activities are dispersed but specialized, so as to achieve efficiency and flexibility at the same time. Furthermore, these dispersed resources are integrated into an interdependent network of worldwide operations.",
                },
                {
                  text_input:
                    "According to George Yip (2003), what must a worldwide marketing strategy be part of?",
                  output:
                    "In terms of marketing strategy, George Yip’s (2003) view is that a worldwide marketing strategy must be part of a worldwide business strategy.",
                },
                {
                  text_input:
                    "According to Yip (2003), when is a global strategy appropriate for marketing?",
                  output:
                    "A global strategy will be appropriate when customer needs are globally common, when there are global customers and channels, and when marketing is globally transferable. In addition, cost drivers are likely to favor a global approach to marketing by creating economies of scale and scope. There are also competitive advantages of global marketing, through, for example, global branding.",
                },
                {
                  text_input: "What is Yip's view on global marketing?",
                  output:
                    "So global marketing is not a blind adherence to standardization of all marketing elements for its own sake, but a different, global approach to developing marketing strategy and programs that blends flexibility with uniformity.",
                },
                {
                  text_input:
                    "What are the two important dimensions of decision-making about marketing activities in an MNC?",
                  output:
                    "Within the general framework introduced in the first section of this chapter, decision-making about marketing activities in a MNC has two important dimensions: (1) decision-making configuration, which refers to the location of various marketing decision centers through the world (geographically centralized or decentralized); and (2) decision-making coordination and integration, which refers to the extent of standardization or adaptation of marketing decisions internationally.",
                },
                {
                  text_input:
                    "What are the three main phases in the evolution of worldwide marketing strategy identified by Douglas and Craig (1989)?",
                  output:
                    "Douglas and Craig (1989) emphasized the importance of coordination and integration issues by relating changes in marketing strategic decisions to the evolution of a firm’s worldwide strategy over time. They identified three main phases in the evolution of worldwide marketing strategy with each stage presenting new strategic challenges and decision priorities to the firm.",
                },
                {
                  text_input:
                    "Describe the three phases in the evolution of worldwide marketing strategy according to Douglas and Craig (1989).",
                  output:
                    "• Phase one: Phase one represents the initial stage of international market expansion where the main strategic decisions facing the business include the choice of country to enter, the mode of entry adopted and the extent of product standardization or adaptation. • Phase two: Once the company has established a ‘beachhead’ in a number of foreign markets, it then begins to seek new directions for growth and expansion, thus moving to phase two of internationalization. • Phase three: It is the third evolutionary phase which is the most important in the context of global marketing. In phase three the business moves towards a global orientation.",
                },
                {
                  text_input:
                    "Explain the two key strategic thrusts in phase three of the evolution of worldwide marketing strategy.",
                  output:
                    "According to Douglas and Craig (1989) there are two key strategic thrusts in phase three. First, the drive to improve the efficiency of worldwide operations through coordination and integration. The second key strategic thrust is the search for global expansion and growth opportunities.",
                },
                {
                  text_input:
                    "Describe decision-making in MNCs that have adopted an international strategy.",
                  output:
                    "In firms following this strategy, the parent retains considerable influence and control over decisions related to its core competencies and the foreign subsidiaries have responsibility over the decisions on how to leverage these competencies by adapting products and other marketing activities to the needs and preferences of their local markets.",
                },
                {
                  text_input:
                    "Describe decision-making in MNCs that have adopted a multinational strategy.",
                  output:
                    "Firms following such a strategy focus primarily on national differences and adopt a more flexible approach to decision-making and marketing strategies country by country in response to national differences in customer preferences, industry characteristics, and government regulations. To better sense and exploit local opportunities, decision-making is decentralized.",
                },
                {
                  text_input:
                    "Describe decision-making in MNCs that have adopted a global strategy.",
                  output:
                    "In MNCs following such a global strategy, research and development, manufacturing, and marketing activities are typically managed from the headquarters, and most strategic decisions are also taken at the center. The role of the subsidiaries is mainly to implement headquarters’ decisions.",
                },
                {
                  text_input:
                    "Describe decision-making in MNCs that have adopted a transnational strategy.",
                  output:
                    "In firms following a transnational strategy, decisions that need corporate management supervision or protection from corporate espionage are usually concentrated at the home country corporate headquarters. Some other strategic decisions are concentrated in different subsidiaries in a configuration described by Ghoshal and Bartlett (1998) as excentralization rather than decentralization.",
                },
                {
                  text_input:
                    "What are the two classic processes that traditionally dominated MNCs' innovative capabilities?",
                  output:
                    "Traditionally, MNCs’ innovative capabilities were dominated by one of two classic processes: center-for-global and local-for-local.",
                },
                {
                  text_input: "Explain the center-for-global innovation model.",
                  output:
                    "In a center-for-global innovation model, the new opportunity or risk that triggered an innovation was usually sensed in the home country, the centralized resources and capabilities of the parent company were brought to create the new product or process, and implementation involved driving the innovation through subsidiaries whose role was to introduce it to their local market.",
                },
                {
                  text_input: "Explain the local-for-local innovation model.",
                  output:
                    "In contrast, local-for-local innovation relies on subsidiary-based knowledge development. Responding to perceived local opportunities, these local entities use their own resources and capabilities to create innovative responses that are then implemented in the local market.",
                },
                {
                  text_input:
                    "What are the two broad categories of transnational innovation processes described by Bartlett and Ghoshal?",
                  output:
                    "These new transnational innovation processes fall into two broad categories that Bartlett and Ghoshal describe as locally leveraged and globally linked.",
                },
                {
                  text_input:
                    "Explain locally leveraged and globally linked innovation processes.",
                  output:
                    "The former involves ensuring that the special resources and capabilities of each national subsidiary are available not only to that local entity, but also to other MNC subsidiaries worldwide. The latter process of innovation pools the resources and capabilities of many different units-at both the parent company and subsidiary level-to jointly create and manage an activity.",
                },
                {
                  text_input:
                    "Describe new product development in firms following an international strategy.",
                  output:
                    "Firms following an international strategy do not have an international new product development strategy per se, but following Vernon (1966)’s international product cycle theory, they first develop new products for their domestic market, and only subsequently sold these products abroad, usually with minimal adaptations.",
                },
                {
                  text_input:
                    "What is the key strength that many Japanese firms built their global leadership positions on?",
                  output:
                    "The key strength on which many Japanese firms built their global leadership positions during the 1970s and 80s in a diverse range of businesses, from zippers to automobiles, lies in the effectiveness of their center-for-global innovations.",
                },
                {
                  text_input:
                    "What are the three factors that explain Japanese MNCs' success in managing the center-for-global process?",
                  output:
                    "Three factors stand out as the most important explanations of Japanese MNCs’ outstanding success in managing the center-for-global process: (1) gaining the input of subsidiaries into centralized activities, (2) ensuring that all functional tasks are linked to market needs, and (3) integrating value chain functions such as development, production, and marketing by managing the transfer of responsibilities among them.",
                },
                {
                  text_input:
                    "Describe new product development in firms following a multinational strategy.",
                  output:
                    "European MNCs rather prefer to develop local-for-local innovation processes, which rely on subsidiary-based knowledge development. Responding to perceived local opportunities, these local entities use their own resources and capabilities to create innovative responses that are then implemented in the local market.",
                },
                {
                  text_input:
                    "What are the three most significant factors that facilitate local-for-local innovations?",
                  output:
                    "Of the many factors that facilitate local-for-local innovations, there are three that are the most significant: (1) the ability to empower local management in the different national organizations; (2) to establish effective mechanisms for linking the local managers to corporate decision-making processes; and (3) to force tight cross-functional integration within each subsidiary.",
                },
                {
                  text_input:
                    "Describe new product development in firms following a transnational strategy.",
                  output:
                    "To tackle this challenge, firms following a transnational strategy have developed a two-pronged approach described by Bartlett and Ghoshal as locally leveraged and globally linked.",
                },
                {
                  text_input:
                    "What are the four key ways that typical services differ from physical products?",
                  output:
                    "Typical services differ from physical products in four key ways: (1) they are intangible as they cannot be stored or readily displayed or communicated; (2) production and consumption of services are inseparable; (3) services cannot be inventoried, and production lines do not exist to deliver standardized products of consistent quality, therefore, delivered services are heterogeneous in nature; finally (4), because services cannot be stored, they assume a perishable nature.",
                },
                {
                  text_input:
                    "What are the three categories of services distinguished by Lovelock and Yip (1996)?",
                  output:
                    "Lovelock and Yip (1996) distinguish between three categories of services: (1) people-processing services, that involve tangible actions to customers in person; (2) possession-processing services, that involve tangible actions to physical objects; and (3) information-based services, that depend on collecting, manipulating, interpreting, and transmitting data to create value.",
                },
                {
                  text_input:
                    "What are the five dimensions of service quality identified by Parasuraman, Zeithaml, and Berry?",
                  output:
                    "Parasuraman, Zeithaml, and Berry identified five dimensions of service quality (SERVQUAL): Reliability, Responsiveness, Assurance, Tangibles, and Empathy.",
                },
                {
                  text_input:
                    "What did Furrer, Liu, and Sudharshan (2000) find regarding the relationship between cultural dimensions and service quality importance?",
                  output:
                    "Furrer, Liu and Sudharshan (2000) used Hofstede’s cultural dimensions to assess whether service quality importance would vary across different cultural orientations. They found, in cultures with a large power distance, significant negative relationships between power distance and empathy, responsiveness, and reliability.",
                },
                {
                  text_input:
                    "What are the two levers that service firms use to achieve both global efficiency and local responsiveness in a transnational strategy?",
                  output:
                    "Service firms following such a transnational strategy have two levers to achieve both global efficiency and local responsiveness by coordinating service quality across countries and cultures: (1) cross-cultural segmentation and (2) the standardization of the core service and the adaptation of supplementary services.",
                },
                {
                  text_input:
                    "What are the five different customer segments identified by Furrer, Liu, and Sudharshan (2000)?",
                  output:
                    "Furrer, Liu and Sudharshan (2000) identified five different customer segments based on differences in the importance of service quality and cultural dimensions: Followers, Balance seekers, Self-confidents, Sensory seekers, and Functional analyzers.",
                },
                {
                  text_input:
                    "What is the essence of the transnational strategy for service firms, according to Lovelock and Yip (1996)?",
                  output:
                    "This is the essence of the transnational strategy, but services offer much more flexibility in this respect than do tangible goods.",
                },
                {
                  text_input:
                    "What are the eight categories of supplementary services?",
                  output:
                    "There are potentially dozens of different supplementary services, although they can be grouped into eight categories: information, consultation, order-taking, hospitality, care-taking, exceptions, billing, and payment.",
                },
                {
                  text_input:
                    "Summarize the conclusion of the chapter on worldwide marketing strategies.",
                  output:
                    "In this chapter, we have presented worldwide marketing strategies as framed by the response to or management of two imperatives: meeting local demands and capitalizing on worldwide competitive advantages. Within this framework, we have identified four generic worldwide strategies: the international, multinational, global, and transnational strategy. We have also shown that these four strategies could be distinguished by their different positioning on three key-dimensions that are: standardization-adaptation, configuration-coordination, and strategic integration.",
                },
                {
                  text_input:
                    "What is the chapter's conclusion on the adoption of generic strategies by MNCs from different regions?",
                  output:
                    "We have also shown that, constrained by their administrative and cultural heritage, MNCs from different regions of the world tend to follow a particular generic strategy: Typical American MNCs tend to follow an international strategy, typical European MNCs tend to follow a multinational strategy, and typical Japanese MNCs tend to adopt a global strategy. More recently, MNCs from all regions have started to converge toward a transnational strategy.",
                },
                {
                  text_input:
                    "What three critical marketing operational strategies did the chapter explore in relation to the four generic strategies?",
                  output:
                    "After the presentation of these four generic strategies, we have explored the consequences of their adoption for three critical marketing operational strategies: (1) marketing decision-making processes; (2) innovation and new product development; and (3) service quality strategies.",
                },
              ],
            ],
          },
        },
        // --- Optional Hyperparameters (add if passed in body) ---
        // hyperparameters: {
        //   ...(body.epochs && { epochCount: body.epochs }),
        //   ...(body.batchSize && { batchSize: body.batchSize }),
        //   ...(body.learningRate && { learningRate: body.learningRate }),
        // },
      },
      // tunedModelId: "my-optional-custom-id", // Optional
    };

    console.log(
      "Sending tuning request:",
      JSON.stringify(requestBody, null, 2)
    );

    // --- Make the API Call ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/tunedModels?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json(); // Attempt to parse JSON regardless of status

    if (!response.ok) {
      console.error("Google API Error:", data);
      const errorDetail =
        data?.error?.message || `HTTP error! Status: ${response.status}`;
      return NextResponse.json(
        {
          error: `Failed to start tuning job: ${errorDetail}`,
          details: data?.error?.details, // Include details if available
        },
        { status: response.status }
      );
    }

    console.log("Tuning job started successfully:", data);
    // The response 'data' here is the Operation object
    return NextResponse.json(
      {
        message: "Tuning job initiated successfully.",
        operation: data, // Return the operation object
      },
      { status: 202 }
    ); // 202 Accepted
  } catch (error: any) {
    console.error("Error in /api/tune/start:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
