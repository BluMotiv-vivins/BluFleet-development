import React, { useState, useEffect } from 'react';
import { X, Download, Clock, User, ChevronDown, ChevronUp, Star, Search, Menu } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const ResearchDetailPage: React.FC<Props> = ({ onClose }) => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-light text-black mr-8">McKinsey & Company</div>
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-gray-700 hover:text-black text-sm">Industries</button>
              <button className="text-gray-700 hover:text-black text-sm">Functions</button>
              <button className="text-gray-700 hover:text-black text-sm">Our insights</button>
              <button className="text-gray-700 hover:text-black text-sm">About us</button>
              <button className="text-gray-700 hover:text-black text-sm">Careers</button>
              <div className="flex items-center space-x-3">
                <Search size={20} className="text-gray-600 cursor-pointer" />
                <button className="text-blue-600 text-sm">Sign in</button>
                <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded">Subscribe</button>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <div className="py-8">
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">
              November 8, 2019 | Report
            </div>
            
            <div className="text-sm text-gray-600 mb-6">
              By Andreas Cornet, Russell Hensley, Carsten Hirschberg, Patrick Schaufuss, Andreas Tschiesner, Andreas Venus, and Julia Werra
            </div>

            <div className="flex items-center space-x-4 mb-8">
              <button className="text-blue-600 text-sm">Share</button>
              <button className="text-blue-600 text-sm">Print</button>
              <button 
                onClick={() => setShowDownloadModal(true)}
                className="text-blue-600 text-sm flex items-center"
              >
                Download
              </button>
              <button className="text-blue-600 text-sm">Save</button>
            </div>
            
            <h1 className="text-5xl font-light text-black mb-8 leading-tight">
              Reboost: A comprehensive view on the changing powertrain component market and how suppliers can succeed
            </h1>
          </div>

          {/* Downloads Section */}
          <div className="bg-gray-50 p-6 mb-8">
            <h3 className="text-lg font-semibold text-black mb-4">DOWNLOADS</h3>
            <a 
              href="#" 
              className="text-blue-600 hover:underline flex items-center"
              onClick={() => setShowDownloadModal(true)}
            >
              Full Report (PDF-806 KB)
            </a>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none text-gray-800">
            <p className="text-xl leading-relaxed mb-8 text-gray-700">
              New research on the potential developments of 28 powertrain component markets suggests the shifts that are coming—and suppliers should start preparing for them now.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              Looking back not even a decade, the automotive industry was largely comprised of the same two powertrain types that had characterized the industry for over a century: gasoline and diesel. Today, there is a broad powertrain mix as the industry—prompted mostly by government mandates—pushes toward more environmentally friendly and efficient transportation. As the powertrain portfolio diversifies and includes an increasing number of hybrid and electric varieties, the powertrain component landscape is becoming more complex and dynamic.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              Due to these developments, which are both driven by and affecting OEMs—and are taking place at a pace that not many would have foreseen a few years ago—suppliers and new entrants alike are taking a comprehensive view on the changing powertrain component market. Based on extensive proprietary research and analyses, we developed a new report, <em>Reboost: A comprehensive view on the changing powertrain component market and how suppliers can succeed</em>. This article is extracted from the broader report, which aims to provide a perspective on three questions that are a top priority for all sector players, especially suppliers:
            </p>

            <ul className="mb-8 space-y-3 text-lg">
              <li>• Why, to what extent, where, and by when will there be significant changes in the powertrain market?</li>
              <li>• What are the most important changes in the powertrain market regarding its main components and systems?</li>
              <li>• How will the changes affect the current powertrain value chains, and how can suppliers successfully respond?</li>
            </ul>

            <p className="mb-6 text-lg leading-relaxed">
              The report first seeks to describe the full set of powertrain technologies, identify their strengths and weaknesses, and assess the impact of various forces on their development and adoption trajectories. We then forecast the growth and examine the structural dynamics of the global powertrain market via a detailed, component-by-component analysis of the various trends—presented in the context of four categories for internal-combustion-engine (ICE) components, three categories for high-voltage (HV) electrification, and one category for fuel cells.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              By projecting the shifts in the powertrain component market and understanding how they will likely affect suppliers, we have derived four key messages:
            </p>

            <p className="mb-4 text-lg leading-relaxed">
              <strong>E-mobility is at a tipping point.</strong> Stronger carbon-dioxide (CO2) regulations, consumer preferences increasingly leaning toward clean-transport solutions, declining battery costs, and infrastructure-rollout acceleration will lead to faster distribution of electric vehicles (EVs) throughout major markets in the early 2020s.
            </p>

            <p className="mb-4 text-lg leading-relaxed">
              <strong>The mix of powertrain technologies underlies several forces and will vary by region.</strong> Regulation, technology, infrastructure, total cost of ownership (TCO), and consumer preferences will be the drivers of the speed of adoption of alternative powertrains over the next five to ten years. These forces vary strongly by region and so will the mix of EVs, hybrid vehicles, and later, fuel-cell electric vehicles.
            </p>

            <p className="mb-4 text-lg leading-relaxed">
              <strong>Powertrain content will see dramatic change.</strong> The diversity of powertrain types is leading to a significant change in the powertrain content per vehicle over time—in quantity, technology, and share of vehicle value. Suppliers need to understand these changes to be able to identify relevant pockets of growth (in electrification) and stagnating or declining component markets (in ICE).
            </p>

            <p className="mb-8 text-lg leading-relaxed">
              <strong>Suppliers are refining their strategies in response to a shifting component market.</strong> Many suppliers are taking a careful look at their existing competencies, the markets they are active in, their long-standing customer relationships, new mobility players, and individual ambitions to reshape their portfolio strategies.
            </p>

            <p className="mb-8 text-lg leading-relaxed">
              In order to help suppliers to successfully navigate the powertrain transition, we offer a four-step approach that can guide them regardless of their starting points, aspirations, or player-specific value pools.
            </p>

            <p className="mb-8 text-lg leading-relaxed">
              The rest of this article focuses on the first part of our report.
            </p>

            <h2 className="text-3xl font-light text-black mb-6 mt-12">Perspective on the automotive powertrain market</h2>
            
            <p className="mb-6 text-lg leading-relaxed">
              To understand the market, we'll look at different architectures, electrification scenarios, and more.
            </p>

            <h3 className="text-2xl font-light text-black mb-4 mt-8">Entering the portfolio game: A technology-neutral assessment of different powertrain architectures</h3>
            
            <p className="mb-6 text-lg leading-relaxed">
              A broad mix of powertrain technologies is currently evolving as the industry—mostly prompted by government mandates—pushes toward more environmentally friendly and efficient transportation (for more, see sidebar, "Overview of today's automotive powertrain landscape").
            </p>

            {/* Exhibit 1 */}
            <div className="my-12 p-6 bg-gray-50 border">
              <div className="text-center mb-4">
                <h4 className="font-semibold">Exhibit 1</h4>
              </div>
              <div className="bg-white p-8 border">
                <div className="text-center">
                  <div className="text-gray-600 mb-4">[Chart showing powertrain technologies with strengths and limitations]</div>
                  <div className="text-sm text-gray-500 italic">
                    Today's powertrain technologies have both strengths and limitations.
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                We strive to provide individuals with disabilities equal access to our website. If you would like information about this content we will be happy to work with you. Please email us at: McKinsey_Website_Accessibility@mckinsey.com
              </div>
            </div>

            <h3 className="text-2xl font-light text-black mb-4 mt-8">Electrification scenarios: Various forces that determine the speed of adoption</h3>
            
            <p className="mb-6 text-lg leading-relaxed">
              Over the next decade, four key factors will determine the speed of adoption of alternative powertrains. In addition, the penetration of electric and HEVs, and later FCEVs, will vary strongly by region.
            </p>

            <h4 className="text-xl font-light text-black mb-3 mt-6">Regulation</h4>
            <p className="mb-6 text-lg leading-relaxed">
              CO2 regulations in all major regions but the US are becoming more rigorous, thereby accelerating the shift from ICEs to EVs. Europe is leading the way with an emission limit of 95 grams per kilometer (g/km) by 2020, and further reduction of 37.5 percent by 2030, resulting in a limit of 59 g/km. To meet the CO2 target in Europe and avoid penalties, OEMs will have to sell 2.2 million EVs (assuming 50 percent PHEVs and 50 percent BEVs) in 2021. In 2018, EV sales in Europe amounted to 0.2 million. In comparison, China's regulation targets are set at 117 g/km and 93 g/km, and North America's current targets are set at over 50 mpg following passenger-vehicle Corporate Average Fuel Economy (CAFE) standards (equivalent to 99 g/km) for 2025. In addition, further emission regulations (for instance, nitrogen oxide [NOx], particulates), access regulations (such as local diesel bans or license-plate regulations), and potential ICE bans will influence adoption on a regional and city level. Globally, several countries have announced targeted end dates for ICEs (for example, Norway plans to phase them out by 2025; Denmark, India, and Israel by 2030; and Canada, China, and the United Kingdom by 2040).
            </p>

            <h4 className="text-xl font-light text-black mb-3 mt-6">Infrastructure</h4>
            <p className="mb-6 text-lg leading-relaxed">
              We estimate a cumulative investment of approximately $50 billion will be needed in charging infrastructure by 2030, not including necessary grid upgrades. (The number of public and private charging stations needed by 2030 would be 15 million in Europe, 14 million in China, and 13 million in North America.) Public grid update will be a key enabler for driving EV adoption rates in China and Europe, while we project about 50 to 70 percent of the charging in North America to be taking place at home. This is confirmed by the fact that range and the ability to charge a vehicle remain the strongest concerns in Europe and the United States, and the second strongest in China. While it is difficult to forecast actual build-out rates, the currently strong investment momentum (supported by public subsidies) and awareness are cause for optimism that insufficient EV infrastructure may only be a bottleneck for a few markets (resulting in a "chicken-egg problem").
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              In addition to the charging station build-out, grid operators will have to respond to locally increasing peak loads (for example, in residential areas with many early adopters) by upgrading transformers or motivating consumers to shift the charging load (smart charging).
            </p>

            <h4 className="text-xl font-light text-black mb-3 mt-6">Technology</h4>
            <p className="mb-6 text-lg leading-relaxed">
              Innovation in battery technology and production have made EVs competitive with conventional combustion-engine vehicles. Batteries constitute a major cost item in BEVs, and their cost has decreased significantly because of technology advancement, production-process optimization, and economies of scale. Since 2010, the cost in dollars per kilowatt-hour (kWh) has dropped by approximately 85 percent, thereby opening the market for EVs further. In 2019, battery-pack costs came down to approximately $178 per kWh on average and $157 per kWh for best in class. Accordingly, cell costs were at approximately $134 per kWh on average and $115 per kWh for best in class. A further cost reduction, down to $100 per kWh, is expected as chemistries are optimized and once large battery factories begin producing at high yield and full utilization. With cell prices expected to reach a $100 per kWh price level over the next five to seven years, C-segment and D-segment vehicles will reach TCO parity (depending on annual mileage), thus enabling mass-market penetration of EVs. Besides the cost of an EV, regional differences in subsidies, electricity versus fuel prices, taxes, and resale values will lead to different customer-adoption rates across regions.
            </p>

            <h4 className="text-xl font-light text-black mb-3 mt-6">Consumer preferences</h4>
            <p className="mb-6 text-lg leading-relaxed">
              With regulatory forces, technology improvements, and infrastructure rollout all in favor of EVs, the question remains, how likely are consumers to adopt? Based on a preview of our proprietary McKinsey Global Electric Vehicle Survey, we anticipate an increase in EV-purchase consideration by consumers across core markets. More than 50 percent of approximately 10,000 customers asked in China, Germany, Norway, and the United States responded that they are considering the purchase of an EV as their next vehicle, up to 1.5 times more than during the last purchase. The McKinsey Center for Future Mobility will publish a report on EV consumer insights in the fourth quarter of 2019, analyzing underlying consumer preferences and concerns.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              Given the uncertainty of the timing and magnitude of EV uptake, we have modeled two scenarios that reflect the relative uncertainty in (city-level) regulation, infrastructure rollout, customer acceptance, and vehicle model availability, as well as battery-technology advancements across regions: a base case, in which EV adoption follows a gradual path, and a breakthrough case, in which all drivers reinforce each other and create accelerated adoption.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              While most new vehicle sales after 2030 will be electric, the transition speed per region will depend significantly on the regional peculiarity of these four levers.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              We expect China to remain the leading market for bringing EVs onto the road, outpacing growth in all other regions. This growth builds on a track record of having sold approximately 1.2 million light EVs in 2018 (about 60 percent of the global total of 2.1 million units) and is driven by the coherent pull across all four factors of infrastructure, regulatory support, technology push, consumer preferences, and vehicle model availability (61 EV brands are available today, by far more than in any other region). In a base case, we expect over 40 percent of vehicles sold in China in 2030 to be electrified, with BEVs being the dominant powertrain technology. We predict Europe will follow China in its EV-adoption curve, with a projected share of almost 40 percent of cars sold being electric by 2030. Given the changing political landscape and differing regulatory directions on both the national level and state level, we see a higher uncertainty in EV uptake in the United States. Therefore, we expect the United States to have the largest ICE share by 2030.
            </p>

            <h3 className="text-2xl font-light text-black mb-4 mt-8">Dynamic growth outlook: Powertrain components will outgrow the vehicle market</h3>
            
            <p className="mb-6 text-lg leading-relaxed">
              Based on the overall vehicle-production growth as well as the shift in powertrain mix described previously, we built a detailed, bottom-up model simulating the market development of 28 powertrain component markets. The simulation is based on the evolution of unit sales combined with average industry prices for these powertrain components and subsystems. Our model projects component-market revenue broken down by region, vehicle segment, and powertrain type from 2018 to 2025. The following analysis is based on a global base-case EV scenario: while the global vehicle market is expected to grow by 1.3 percent a year in units by 2025 (base year 2018), we expect the powertrain component market to grow at double that pace, with about 4.7 percent in revenue by 2025, giving rise to new opportunities for suppliers. As such, we estimate the overall powertrain market to reach $435 billion by 2025.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              Revenue development outgrowing the vehicle market is caused by an underlying shift toward powertrains with higher powertrain content per vehicle. This can be explained by two factors: more content for hybrid vehicles and EVs via battery pack, but also more content per vehicle for ICEs (for example, through increased turbocharging, 48V electrification, and more complex exhaust-gas-aftertreatment systems). Exhibit 2 compares vehicle-unit growth and revenue growth by powertrain technology.
            </p>

            {/* Exhibit 2 */}
            <div className="my-12 p-6 bg-gray-50 border">
              <div className="text-center mb-4">
                <h4 className="font-semibold">Exhibit 2</h4>
              </div>
              <div className="bg-white p-8 border">
                <div className="text-center">
                  <div className="text-gray-600 mb-4">[Chart showing dynamic growth industry comparison]</div>
                  <div className="text-sm text-gray-500 italic">
                    In this dynamic growth industry, global powertrain revenues will exceed global vehicle units, with different dynamics for different powertrain technologies.
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                We strive to provide individuals with disabilities equal access to our website. If you would like information about this content we will be happy to work with you. Please email us at: McKinsey_Website_Accessibility@mckinsey.com
              </div>
            </div>

            <h3 className="text-2xl font-light text-black mb-4 mt-8">Outlook on powertrain content per vehicle: Identifying pockets of growth in a stagnating ICE market</h3>
            
            <p className="mb-6 text-lg leading-relaxed">
              To understand the development of the component market, we have broken down the powertrain market into seven systems and 28 components. The components can be analyzed by market-driver categories that explain the underlying component-market characteristics: that is, legacy-, backbone-, regulation-, and LV-electrification-driven markets. An additional cross-cutting category, sensors and actuators, will also be taken into consideration.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              With regard to ICE powertrain components, we propose a differentiated view on the underlying market drivers. Legacy components are traditional ICE components where only moderate technological innovation is expected and market consolidation will likely start within the next years (for example, base engine and port fuel injection). Backbone components (for example, ECU, thermal management, and direct injection) require system or electronics understanding and can be a profound basis for the development of next-generation ICE/MHEV powertrains, and for the successful transition to alternative powertrains. Regulation ICE components enable better emission performance in traditional ICEs (for example, aftertreatment system and turbocharger) and their market development correlates with regulatory targets (for example, CO2 and NOx).
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              Taking into account these market-driver categories, Exhibit 3 shows how the value shift will evolve. Legacy components are expected to slightly shrink already by 2025, and we predict the same for backbone and regulation components by 2030. We foresee the strongest short-term (2018 to 2025) growth in LV-electronic components (over 50 percent compound annual growth rate) and the HV battery (over 25 percent). The latter will, by far, also constitute the largest value pool, with a market size of more than $70 billion by 2025.
            </p>

            {/* Exhibit 3 */}
            <div className="my-12 p-6 bg-gray-50 border">
              <div className="text-center mb-4">
                <h4 className="font-semibold">Exhibit 3</h4>
              </div>
              <div className="bg-white p-8 border">
                <div className="text-center">
                  <div className="text-gray-600 mb-4">[Chart showing automotive powertrain component market evolution]</div>
                  <div className="text-sm text-gray-500 italic">
                    The automotive-powertrain-component market has started to become a different industry—changing from a stable technology to a complex portfolio game.
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                We strive to provide individuals with disabilities equal access to our website. If you would like information about this content we will be happy to work with you. Please email us at: McKinsey_Website_Accessibility@mckinsey.com
              </div>
            </div>

            <p className="mb-6 text-lg leading-relaxed">
              By 2025, legacy and backbone components will constitute only 6 percent of total market growth, with most of the growth (94 percent) resulting from regulation- and electrification-related (LV and HV) components.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              The changes in revenue pools are strongly correlated with the underlying shift in the powertrain mix discussed earlier. This is clearly visible when comparing the estimated content-per-vehicle (CPV) development until 2025. CPV is defined as value (cost plus markup) of the powertrain components per vehicle.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              While over time the average CPV will decrease within each powertrain type, considering standard technological and cost developments, we observe a few elements lead to the increasing overall revenue pools: a shift to powertrain types with an overall higher CPV. While an average ICE powertrain (assuming a C-segment vehicle) holds approximately 20 percent of the vehicle value at an average cost of $3,000, an average BEV powertrain costs approximately $10,000 for a vehicle in the same segment (assuming a 50 kWh battery), making up about 50 percent of a vehicle's value today. Most of this cost is driven by the battery, but power electronics and e-drive units also hold significant cost shares.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              In conclusion, we expect the powertrain component market to grow, but with a fundamental shift in value creation from mechanical to electrical, "mechatronic," and electrochemical. Automotive suppliers should manage their portfolio and decide on where and how to participate in this growth. Increased cost pressure on traditional components on the one hand, and high R&D expenditures to enter a highly competitive alternative powertrain market with initially low sales volumes on the other hand, force choices by automotive suppliers.
            </p>

            <h2 className="text-3xl font-light text-black mb-6 mt-12">How to start navigating the changing powertrain landscape</h2>
            
            <p className="mb-6 text-lg leading-relaxed">
              Today, many suppliers are refining their powertrain portfolio strategies. The optimal portfolio strategy and choice of value pools will vary based on the supplier's existing competencies, the markets where the supplier is active, any long-standing customer relationships, and its target or ambition. A four-step approach can guide suppliers (Exhibit 4).
            </p>

            {/* Exhibit 4 */}
            <div className="my-12 p-6 bg-gray-50 border">
              <div className="text-center mb-4">
                <h4 className="font-semibold">Exhibit 4</h4>
              </div>
              <div className="bg-white p-8 border">
                <div className="text-center">
                  <div className="text-gray-600 mb-4">[Chart showing four-step approach for suppliers]</div>
                  <div className="text-sm text-gray-500 italic">
                    Successful transition management for suppliers entails four elements.
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                We strive to provide individuals with disabilities equal access to our website. If you would like information about this content we will be happy to work with you. Please email us at: McKinsey_Website_Accessibility@mckinsey.com
              </div>
            </div>

            <p className="mb-6 text-lg leading-relaxed">
              This approach can help suppliers navigate through the powertrain transition successfully, regardless of their starting point or aspirations:
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              <strong>• Develop a tangible vision and clear strategy.</strong> A clear, communicated strategy is the key to managing the powertrain transition—it is essential for the supplier's success and for buy-in among employees and investors. To manage the uncertainty inherent in this transition, it is important to develop the strategy within a scenario framework. A robust portfolio that will perform well under different scenarios (for regional regulation and electrification momentum, for example) is a cornerstone of success. In this context, clearly defined trigger points (for instance, changes in regulations, incentives, or customer preferences) should be tracked and made available for annual strategic reviews. At the same time, the guiding vision must be broken down into specific, tangible strategic guidelines for the whole organization to follow.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              <strong>• Assess performance focus areas granularly, but steer them globally.</strong> A successful transformation also depends on rigid performance assessments in order to identify not only focus areas of growth but also focus areas of high performance for the individual supplier. A unified company-wide approach, to steering performance cells along clearly defined key performance indicators, is a prerequisite. This allows each supplier to determine promising markets based on the combination of market attractiveness and the company's performance on a product, market, or customer level.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              <strong>• Allocate resources through an "old- versus new-world" lens.</strong> Resources should be strategically allocated to trend-triggered product development within a defined budget. R&D efforts should focus on future markets, while backbone and legacy markets should follow a low-invest and cash-out logic. Here, suppliers, OEMs, and public-sector players need to cooperate in order to bundle research efforts and ensure competitive, viable, and promising solutions for the future of powertrain technology.
            </p>

            <p className="mb-6 text-lg leading-relaxed">
              <strong>• Prioritize a culture of performance and accountability.</strong> Top management should identify the organization's major transition-related strengths and weaknesses. Knowing the specific cultural prerequisites will lay the foundation for the successful transition into the new powertrain world. This transition should be led from the top, with a strong and empowered performance office that steers overall performance and manages compliance with the clearly defined strategy.
            </p>

            <p className="mb-8 text-lg leading-relaxed">
              The road ahead is obviously challenging: new technological possibilities and tightening environmental requirements are upending many long-standing principles of the powertrain industry. By transferring their existing strengths into the new industry context, joining forces with partners (other suppliers, OEMs, or new mobility players), and working proactively, suppliers can manage their transitions successfully and shape portfolios that secure their profit pools in the automotive future.
            </p>

            <p className="mb-8 text-lg leading-relaxed">
              Download <a href="#" onClick={() => setShowDownloadModal(true)} className="text-blue-600 hover:underline">Reboost: A comprehensive view on the changing powertrain component market and how suppliers can succeed</a>, the full report on which this article is based (PDF–921KB).
            </p>

            {/* Rating Section */}
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h4 className="text-lg font-semibold text-black mb-4">How relevant and useful is this article for you?</h4>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(star)}
                    className="text-2xl focus:outline-none"
                  >
                    <Star 
                      size={24} 
                      className={
                        star <= (hoverRating || userRating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Author Section */}
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h4 className="text-lg font-semibold text-black mb-4">ABOUT THE AUTHOR(S)</h4>
              <p className="text-lg leading-relaxed mb-4">
                <a href="#" className="text-blue-600 hover:underline">Andreas Cornet</a> and <a href="#" className="text-blue-600 hover:underline">Andreas Tschiesner</a> are senior partners in McKinsey's Munich office, where Patrick Schaufuss is an associate partner; Carsten Hirschberg is a senior partner in the Berlin office, where Andreas Venus is a partner and Julia Werra is a consultant. <a href="#" className="text-blue-600 hover:underline">Russell Hensley</a> is a senior partner in the Detroit office.
              </p>
              <div className="bg-blue-600 text-white p-4 rounded">
                <p className="mb-2">Talk to us</p>
                <p className="text-sm">Our experts are always happy to discuss your issue. Reach out, and we'll connect you with a member of our team.</p>
              </div>
            </div>

            {/* Career Section */}
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h4 className="text-lg font-semibold text-black mb-4">EXPLORE A CAREER WITH US</h4>
              <a href="#" className="text-blue-600 hover:underline">Search openings</a>
            </div>

            {/* Related Articles */}
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h4 className="text-lg font-semibold text-black mb-6">RELATED ARTICLES</h4>
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Article - McKinsey Quarterly</div>
                  <h5 className="text-xl text-blue-600 hover:underline cursor-pointer">
                    Reimagining mobility: A CEO's guide
                  </h5>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Article</div>
                  <h5 className="text-xl text-blue-600 hover:underline cursor-pointer">
                    Outlook on the automotive software and electronics market through 2030
                  </h5>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Article</div>
                  <h5 className="text-xl text-blue-600 hover:underline cursor-pointer">
                    How will changes in the automotive-component market affect semiconductor companies?
                  </h5>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h4 className="text-lg font-semibold text-black mb-4">Sign up for emails on new Automotive & Assembly articles</h4>
              <p className="text-lg mb-4">Never miss an insight. We'll email you when new articles are published on this topic.</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Download Report</h3>
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Access the full research report "Reboost: A comprehensive view on the changing powertrain component market and how suppliers can succeed" (PDF, 806 KB).
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Download PDF
              </button>
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchDetailPage;
