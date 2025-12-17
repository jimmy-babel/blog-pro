import React from 'react'
import Image from 'next/image';
type Props = {
  imgBg?:string
}

const HeaderContent = (props: Props) => {
  const {imgBg} = props;
  const HeaderBg = React.useMemo(() => {
    return (
      <>
        {<>
          <div className='w-full h-[calc(30vh-75px)]'></div>
          <div className='w-full absolute h-[30vh] left-0 top-0 z-[-1] header-box'>
            <div className="w-full h-full relative">
              <Image
                fill
                className="w-full h-full object-cover"
                src={imgBg || ""}
                alt=""
              />
            </div>
          </div>
        </>}
      </>
    );
  }, [imgBg]);

  return (
    <>
      {HeaderBg}
    </>
  )
}

export default HeaderContent;