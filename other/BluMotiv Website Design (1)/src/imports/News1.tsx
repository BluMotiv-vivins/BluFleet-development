import imgDassault1 from "figma:asset/eb9cfc5cf1a14858102dcd4daa6bb9b5d106a8f6.png";

export default function News1() {
  return (
    <div className="bg-white relative size-full" data-name="News 1">
      <div className="absolute bg-center bg-cover bg-no-repeat h-[465px] top-0 translate-x-[-50%] w-[696px]" data-name="Dassault 1" style={{ left: "calc(50% + 0.5px)", backgroundImage: `url('${imgDassault1}')` }} />
    </div>
  );
}