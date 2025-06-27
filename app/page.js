import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="parent page">
        <div className="container flex flex-col justify-center items-center gap-5">
          <h1 className="h1 tc">
            Viximate - You <span className="accent">Imagine</span> we <span className="accent">Create</span>
          </h1>

          <p className="tc">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Commodi
            corporis natus amet qui nobis ut suscipit beatae reprehenderit vitae
            magnam dicta ipsum id, maxime nulla perspiciatis exercitationem
            maiores velit dolore iusto, molestias ab, provident quae! Reiciendis
            laboriosam natus unde similique quas exercitationem dicta explicabo
            mollitia, quibusdam numquam libero nam deserunt?
          </p>

          <Link href="/" className="btn">
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
}
